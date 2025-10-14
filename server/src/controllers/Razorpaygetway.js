const axios = require("axios");
const Order = require("../models/Order");
const { createNotification } = require("./notificationController");
const mongoose = require("mongoose");
const crypto = require("crypto"); // Razorpay signature verification ke liye
require("dotenv").config();

// ✅ Environment Variables ko Razorpay ke hisaab se change kiya
const {
  RAZORPAY_KEY_ID,
  RAZORPAY_SECRET,
  SERVER_URL,
  CLIENT_URL,
} = process.env;

// Razorpay ke liye SDK/Library use ho sakti hai, par yahaan hum simple API call/crypto use karenge.
// Agar aapko puri library use karni hai toh `require('razorpay')` use karein,
// Lekin hum yahaan low-level `axios` aur `crypto` use kar rahe hain, jaise aapne request kiya.

// --- Helper: Razorpay Order Create karne ke liye ---
const createRazorpayOrder = async (amountInPaisa, receiptId) => {
  // Amount ko paise mein convert karna zaroori hai
  const data = {
    amount: amountInPaisa, // Amount in paise
    currency: "INR",
    receipt: receiptId,
    payment_capture: "1", // 1 for auto-capture
  };

  try {
    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: RAZORPAY_KEY_ID, // Key ID as username
          password: RAZORPAY_SECRET, // Key Secret as password
        },
      }
    );
    return response.data; // Includes 'id' which is razorpayOrderId
  } catch (error) {
    console.error(
      "❌ Razorpay API Error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error?.description || "Failed to create Razorpay Order"
    );
  }
};

// --- Helper: Razorpay Signature Verify karne ke liye ---
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  return generatedSignature === signature;
};

// =============================================================================

// ✅ Endpoint: /razorpay/create-order
exports.createOrder = async (req, res) => {
  try {
    // 1. Environment Variable Validation (Cashfree se Razorpay mein change kiya)
    if (!SERVER_URL || !CLIENT_URL) {
      console.error(
        "❌ Missing required environment variables: SERVER_URL or CLIENT_URL"
      );
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Missing environment variables",
      });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
      console.error("❌ Missing Razorpay environment variables");
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error: Razorpay keys missing",
      });
    }

    console.log("💳 Processing payment request:", req.body);

    const {
      userId,
      items,
      shippingAddress,
      paymentMethod,
      Contact_number,
      user_email,
      itemsTotal,
      deliveryCharge,
      totalAmount,
      notes,
    } = req.body;

    // ... (Validation and Total Calculation same rahega) ...

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    if (!shippingAddress || !Contact_number || !user_email) {
      return res.status(400).json({
        success: false,
        message: "Shipping address, contact number, and email are required",
      });
    }

    let finalTotal = totalAmount;
    let calculatedItemsTotal = itemsTotal;
    let deliveryFee = deliveryCharge || 80;

    if (!finalTotal) {
      calculatedItemsTotal = items.reduce((total, item) => {
        return total + parseFloat(item.price) * parseInt(item.quantity);
      }, 0);
      finalTotal = calculatedItemsTotal + deliveryFee;
    }

    const amountInPaisa = Math.round(finalTotal * 100); // ✅ Important: Razorpay uses paise

    // Format items and base order data
    const formattedItems = items.map((item) => ({
      productId: mongoose.Types.ObjectId.isValid(item.productId)
        ? new mongoose.Types.ObjectId(item.productId)
        : item.productId,
      quantity: parseInt(item.quantity) || 1,
      price: parseFloat(item.price) || 0,
      name: item.name || null,
      image: item.image || null,
    }));

    const baseOrderData = {
      userId: new mongoose.Types.ObjectId(userId),
      items: formattedItems,
      shippingAddress: {
        street: shippingAddress.street?.trim(),
        city: shippingAddress.city?.trim(),
        state: shippingAddress.state?.trim(),
        pincode: shippingAddress.pincode?.toString().trim(),
        country: shippingAddress.country || "India",
      },
      itemsTotal: calculatedItemsTotal,
      deliveryCharge: deliveryFee,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod || "cod",
      Contact_number: Contact_number.toString(),
      user_email: user_email.trim(),
      notes: notes?.trim() || null,
      isCustomHamper: req.body.isCustomHamper || false,
    };

    // 2. COD Handling (Same rahega)
    if (paymentMethod === "cod") {
      const codOrder = new Order({
        ...baseOrderData,
        paymentStatus: "pending",
        status: "pending",
      });

      const savedOrder = await codOrder.save();
      await createNotification(
        userId,
        "COD Order Placed Successfully",
        `Your COD order #${savedOrder._id.toString().slice(-6).toUpperCase()} has been placed. Total: ₹${finalTotal} (Pay on delivery).`,
        "order",
        savedOrder._id
      );

      console.log("✅ COD Order created:", savedOrder._id);
      return res.json({
        success: true,
        message: "COD order created successfully",
        orderId: savedOrder._id,
        order: savedOrder,
        paymentMethod: "cod",
      });
    }

    // 3. Online Payment Handling: Razorpay Order Creation
    if (paymentMethod === "online") {
      // Internal Receipt ID/Order ID for DB
      const internalReceiptId = `receipt_${Date.now()}`;

      // A. Pehle DB mein order create karein with 'initiated' status
      const pendingOrder = new Order({
        ...baseOrderData,
        paymentStatus: "initiated",
        status: "pending",
        paymentMethod: "online",
        // cashfreeOrderId ke bajaye ab yeh hamara internal receipt ID hai
        // ya phir hum Razorpay ka order ID bhi store kar sakte hain baad mein
        razorpayReceiptId: internalReceiptId, 
      });

      const savedOrder = await pendingOrder.save();

      try {
        // B. Razorpay Order Create karein
        const razorpayOrder = await createRazorpayOrder(
          amountInPaisa,
          internalReceiptId
        );

        // C. Razorpay Order ID ko DB mein save karein
        savedOrder.razorpayOrderId = razorpayOrder.id; // Razorpay se mila Order ID
        savedOrder.razorpayAmount = amountInPaisa;
        await savedOrder.save();

        console.log("✅ Razorpay Order created:", razorpayOrder.id);

        return res.json({
          success: true,
          message: "Payment session created",
          razorpayOrderId: razorpayOrder.id, // Frontend ko bhejte hain
          internalOrderId: savedOrder._id, // Hamara DB Order ID
          amount: amountInPaisa, // Frontend ko paise mein amount chahiye
          razorpayKeyId: RAZORPAY_KEY_ID, // Frontend ko Key ID bhi chahiye
          paymentMethod: "online",
        });
      } catch (razorpayError) {
        console.error("❌ Razorpay API error:", razorpayError.message);

        // Order ko mark as failed and save
        savedOrder.status = "failed";
        savedOrder.paymentStatus = "failed";
        await savedOrder.save();

        return res.status(500).json({
          success: false,
          message: razorpayError.message,
          orderId: savedOrder._id,
          error: razorpayError.message,
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: "Invalid payment method. Use 'cod' or 'online'",
    });
  } catch (error) {
    console.error("❌ Payment creation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment creation",
      error: error.message,
    });
  }
};

// -----------------------------------------------------------------------------

// ✅ Endpoint: /razorpay/verify-payment (Frontend callback ke liye)
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      internalOrderId, // Hamara DB Order ID
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !internalOrderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details for verification",
      });
    }

    // 1. Order ko DB mein find karein
    const order = await Order.findById(internalOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found in database",
      });
    }

    // 2. Signature Verify karein
    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (isSignatureValid) {
      // ✅ Signature Valid: Payment Successful
      order.paymentStatus = "paid";
      order.status = "processing";
      order.paymentId = razorpay_payment_id;
      order.razorpayOrderId = razorpay_order_id;
      await order.save();

      // Notification
      await createNotification(
        order.userId,
        "Payment Confirmed",
        `Your payment of ₹${order.totalAmount} has been confirmed. Order #${order._id
          .toString()
          .slice(-6)
          .toUpperCase()} is now processing.`,
        "order",
        order._id
      );

      console.log("✅ Payment verified and order updated:", order._id);

      return res.json({
        success: true,
        message: "Payment verified successfully",
        paymentStatus: "SUCCESS",
        orderId: order._id,
      });
    } else {
      // ❌ Signature Invalid: Payment Failed
      order.paymentStatus = "failed";
      order.status = "failed";
      await order.save();

      console.log("❌ Razorpay Signature Verification Failed");

      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
        paymentStatus: "FAILED",
        orderId: order._id,
      });
    }
  } catch (error) {
    console.error("❌ Razorpay verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment verification",
      error: error.message,
    });
  }
};

// -----------------------------------------------------------------------------

// getUserOrders function same rahega kyunki woh DB se related hai.
exports.getUserOrders = async (req, res) => {
  // ... (Code for getUserOrders remains the same) ...
  try {
    const { userId } = req.params;
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    if (status && status !== "all") filter.status = status;
    if (paymentStatus && paymentStatus !== "all")
      filter.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate({
        path: "items.productId",
        select:
          "Product_name Product_image Hamper_price Product_price name image",
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching orders",
      error: error.message,
    });
  }
};

// -----------------------------------------------------------------------------

// ✅ Endpoint: /razorpay/webhook (Webhook Cashfree se Razorpay style mein change kiya)
// NOTE: Razorpay Webhook data alag structure mein hota hai aur iski integrity verify karni zaroori hai.
exports.handleWebhook = async (req, res) => {
  const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET; // ✅ Webhook secret apka environment variable mein hona chahiye

  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.error("❌ Razorpay Webhook Secret missing!");
    return res.status(500).json({ success: false, message: "Server configuration error" });
  }

  // 1. Webhook Signature Verification
  const shasum = crypto.createHmac("sha256", RAZORPAY_WEBHOOK_SECRET);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  const razorpaySignature = req.headers["x-razorpay-signature"];

  if (digest !== razorpaySignature) {
    console.error("❌ Webhook Signature Invalid!");
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  try {
    console.log("🔔 Razorpay webhook received (Signature Valid):", req.body.event);

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured" || event === "order.paid") {
      const paymentData = payload.payment || payload.order;
      const razorpayOrderId = paymentData.order_id;
      const razorpayPaymentId = paymentData.id || paymentData.entity?.id; // payment.captured vs order.paid ke hisaab se

      if (!razorpayOrderId) {
        console.error("Webhook data is missing order_id.");
        return res.status(400).json({ success: false });
      }

      // 2. Order find karna
      const order = await Order.findOne({ razorpayOrderId: razorpayOrderId });

      if (order && order.paymentStatus !== "paid") {
        // 3. Order update karna
        order.paymentStatus = "paid";
        order.status = "processing";
        order.paymentId = razorpayPaymentId || order.paymentId; // Payment ID agar available ho
        order.paymentMethod = "online";
        await order.save();

        await createNotification(
          order.userId,
          "Payment Confirmed (Webhook)",
          `Your payment of ₹${order.totalAmount} has been confirmed. Order #${order._id
            .toString()
            .slice(-6)
            .toUpperCase()} is now processing.`,
          "order",
          order._id
        );

        console.log("✅ Order updated via webhook:", order._id);
      } else if (order.paymentStatus === "paid") {
        console.log("⚠️ Order already paid, ignoring webhook.");
      } else {
        console.log("❌ Order not found for Razorpay Order ID:", razorpayOrderId);
      }
    }
    
    // Sab kuch theek hone par 200 return karein, chahe order update hua ho ya nahi
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;