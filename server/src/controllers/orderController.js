
const Order = require("../models/Order");
const User = require("../models/user");
const { createNotification } = require("./notificationController");
const mongoose = require('mongoose');

// Enhanced create order with proper validation
const createOrder = async (req, res) => {
  try {
    console.log('📦 Creating new order for user:', req.user._id);
    console.log('📦 Request body:', req.body);

    const { 
      items, 
      shippingAddress, 
      paymentMethod, 
      totalAmount,
      Contact_number,
      user_email,
      notes 
    } = req.body;

    // Enhanced validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Order must contain at least one item" 
      });
    }

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required"
      });
    }

    const requiredAddressFields = ['street', 'city', 'state', 'pincode'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required in shipping address`
        });
      }
    }

    // Get user details if missing
    let orderEmail = user_email;
    let contactNumber = Contact_number;
    
    if (!orderEmail || !contactNumber) {
      const user = await User.findById(req.user._id);
      if (!orderEmail) orderEmail = user?.email;
      if (!contactNumber) contactNumber = user?.phoneNo;
    }

    // Validate required contact info
    if (!contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Contact number is required"
      });
    }

    if (!orderEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Validate and format items
    const formattedItems = items.map(item => {
      if (!item.productId) {
        throw new Error('Product ID is required for all items');
      }
      
      return {
        productId: mongoose.Types.ObjectId.isValid(item.productId) ? 
          new mongoose.Types.ObjectId(item.productId) : item.productId,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0
      };
    });

    // Create order with enhanced data
    const orderData = {
      userId: req.user._id,
      items: formattedItems,
      shippingAddress: {
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.toString().trim(),
        country: shippingAddress.country || 'India'
      },
      paymentMethod: paymentMethod || 'cod',
      totalAmount: totalAmount || 0,
      paymentStatus: "pending",
      status: "pending",
      Contact_number: contactNumber.toString(),
      user_email: orderEmail,
      notes: notes?.trim() || null
    };

    console.log('📦 Creating order with data:', orderData);

    const order = await Order.create(orderData);

    // Create notification
    await createNotification(
      req.user._id,
      "Order Placed Successfully",
      `Your order #${order._id.toString().slice(-6).toUpperCase()} has been placed and is being processed.`,
      "order",
      order._id
    );

    // Populate the response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.productId', 'name price images category')
      .populate('userId', 'firstName lastName email');

    console.log('✅ Order created successfully:', order._id);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });

  } catch (err) {
    console.error("❌ Create Order Error:", err);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid ${err.path}: ${err.value}`
      });
    }

    if (err.message.includes('Product ID')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Error creating order",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Enhanced get all orders with pagination
const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus 
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate("userId", "firstName lastName email phoneNo")
      .populate("items.productId", "name price images category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      message: "Orders fetched successfully",
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Get All Orders Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching orders" 
    });
  }
};

// Enhanced get user orders
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (status && status !== 'all') filter.status = status;

    const orders = await Order.find(filter)
      .populate("items.productId", "name price images category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      message: "Orders fetched successfully",
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Get User Orders Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching orders" 
    });
  }
};

// Enhanced get single order
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(id)
      .populate("userId", "firstName lastName email phoneNo")
      .populate("items.productId", "name price images category description");

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      order.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to view this order" 
      });
    }

    res.json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (err) {
    console.error("Get Order Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching order" 
    });
  }
};

// Enhanced update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const order = await Order.findById(id)
      .populate("userId", "firstName lastName email");

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // Update order
    order.status = status;
    if (status === 'shipped' && trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    await order.save();

    // Enhanced notification messages
    const notificationMessages = {
      processing: "Your order is now being processed and will be prepared for shipping soon.",
      shipped: `Your order has been shipped! ${trackingNumber ? `Tracking: ${trackingNumber}` : 'Track your delivery.'}`,
      delivered: "Your order has been delivered successfully. Thank you for shopping with us!",
      cancelled: "Your order has been cancelled. If you have any questions, please contact support.",
    };

    if (notificationMessages[status]) {
      await createNotification(
        order.userId._id,
        `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Order #${order._id.toString().slice(-6).toUpperCase()}: ${notificationMessages[status]}`,
        "order",
        order._id
      );
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error updating order status" 
    });
  }
};

// Enhanced update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    // Validate payment status
    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    const order = await Order.findById(id)
      .populate("userId", "firstName lastName email");

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    order.paymentStatus = paymentStatus;
    if (paymentId) {
      order.paymentId = paymentId;
    }
    await order.save();

    const notificationMessages = {
      paid: "Payment received successfully for your order. Thank you!",
      failed: "Payment failed for your order. Please try again or contact support.",
      pending: "Payment is pending for your order. We'll update you once confirmed.",
    };

    if (notificationMessages[paymentStatus]) {
      await createNotification(
        order.userId._id,
        `Payment ${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}`,
        `Order #${order._id.toString().slice(-6).toUpperCase()}: ${notificationMessages[paymentStatus]}`,
        "order",
        order._id
      );
    }

    res.json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (err) {
    console.error("Update Payment Status Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error updating payment status" 
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
};
