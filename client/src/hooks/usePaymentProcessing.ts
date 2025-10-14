import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import axiosInstance from "@/utils/axiosConfig";

// Razorpay ke liye Script Load karne ka Helper Function
const loadRazorpayScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Razorpay Options ka Type
interface RazorpayOptions {
  key: string; 
  amount: number; // Amount in paise
  currency: string;
  name: string;
  description: string;
  order_id: string; // Razorpay Order ID from backend
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

// Extend Window interface for Razorpay (Cashfree se replace kiya)
declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): {
        on: (event: string, callback: (response: any) => void) => void;
        open: () => void;
      };
    };
  }
}

export const usePaymentProcessing = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // **NOTE:** Razorpay Key ID ko environment variable se fetch karna best practice hai
  const RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID"; // 🚨 Apni actual key se replace karein

  const processPayment = async (
    items: any[],
    shippingAddress: any,
    paymentMethod: "cod" | "online",
    totals: { itemsTotal: number; deliveryCharge: number; totalAmount: number },
    cartType: "cart" | "hamper" = "cart"
  ) => {
    try {
      setCheckoutLoading(true);

      const orderData = {
        userId: user._id,
        items: items,
        shippingAddress: {
          street: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pinCode,
          country: "India",
        },
        itemsTotal: totals.itemsTotal,
        deliveryCharge: totals.deliveryCharge,
        totalAmount: totals.totalAmount,
        paymentMethod: paymentMethod,
        Contact_number: shippingAddress.phone,
        user_email: user.email,
        isCustomHamper: cartType === "hamper",
      };

      console.log("📤 Sending order data:", orderData);
      // ✅ Endpoint update kiya: /cashfree/create se /razorpay/create-order
      const response = await axiosInstance.post("/razorpay/create-order", orderData); 

      if (response.data.success) {
        if (paymentMethod === "cod") {
          // COD flow same rahega
          if (cartType === "cart") {
            await axiosInstance.delete("/cart/clear");
          } else if (cartType === "hamper") {
            await axiosInstance.delete("/hamper/clear");
          }

          toast({
            title: "Order Placed Successfully! 🎉",
            description:
              "Your order has been placed. Check 'My Orders' to track it.",
          });
          navigate("/orders");
          return true;
        } else {
          // ✅ Razorpay online payment handling
          const { razorpayOrderId, internalOrderId, amount, razorpayKeyId } = response.data; // Server se Razorpay data expect kiya

          // Step 1: Razorpay Script Load karna
          const isLoaded = await loadRazorpayScript(
            "https://checkout.razorpay.com/v1/checkout.js"
          );

          if (!isLoaded || !window.Razorpay) {
            toast({
              title: "Payment Error",
              description: "Razorpay script load nahi ho paya. Phir se try karein.",
              variant: "destructive",
            });
            return false;
          }

          // Step 2: Payment Verification Handler
          const handlePaymentSuccess = async (razorpayResponse: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // Payment success hone par server par verification call karna
              const verifyRes = await axiosInstance.post(
                "/razorpay/verify-payment", // ✅ Verification endpoint update kiya
                {
                  ...razorpayResponse,
                  internalOrderId, // Hamara DB order ID
                }
              );

              if (verifyRes.data.success) {
                // Payment successful aur order process ho gaya
                if (cartType === "cart") {
                  await axiosInstance.delete("/cart/clear");
                } else if (cartType === "hamper") {
                  await axiosInstance.delete("/hamper/clear");
                }

                toast({
                  title: "Payment Successful! 🥳",
                  description: "Aapka payment ho gaya aur order place ho chuka hai.",
                });
                navigate("/orders");
                return true;
              } else {
                // Verification failed 
                toast({
                  title: "Payment Verification Failed",
                  description:
                    verifyRes.data.message ||
                    "Payment verify nahi ho paya. Order status check karein.",
                  variant: "destructive",
                  duration: 8000,
                });
                navigate("/orders"); 
                return false;
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              toast({
                title: "Payment Status Unknown",
                description:
                  "Transaction complete ho gayi hai, par status unknown hai. Please contact support.",
                variant: "destructive",
                duration: 8000,
              });
              // navigate("/orders"); // Status unknown hone par user ko Order page pe le ja sakte hain
              return false;
            }
          };

          // Step 3: Razorpay Checkout Options
          const options: RazorpayOptions = {
            key: razorpayKeyId || RAZORPAY_KEY_ID, // Server se mili key ya fallback key
            amount: amount, // Amount in paise
            currency: "INR",
            name: "Your Company Name", 
            description: `Order ID: ${internalOrderId}`,
            order_id: razorpayOrderId, 
            handler: handlePaymentSuccess, 

            prefill: {
              name: user.name || "Customer", 
              email: user.email, 
              contact: shippingAddress.phone, 
            },
            notes: {
              address: `${shippingAddress.street}, ${shippingAddress.city}`,
            },
            theme: {
              color: "#3399cc", 
            },
          };

          // Step 4: Razorpay Open karna
          const rzp1 = new window.Razorpay(options);

          // Payment close hone par handle karein (user ne close kar diya)
          rzp1.on("payment.failed", function (response: any) {
            console.error("❌ Razorpay Payment Failed:", response.error);
            toast({
              title: "Payment Failed",
              description: response.error.description || "Aapka payment fail ho gaya.",
              variant: "destructive",
            });
          });

          rzp1.open();
          return true; // Payment window open ho gaya
        }
      } else {
        // Order creation failed on backend
        throw new Error(response.data.message || "Failed to create order");
      }
    } catch (error: any) {
      console.error("Payment processing error:", error);
      toast({
        title: "Payment Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to process payment.",
        variant: "destructive",
      });
      return false;
    } finally {
      setCheckoutLoading(false);
    }
  };

  return {
    checkoutLoading,
    processPayment,
  };
};