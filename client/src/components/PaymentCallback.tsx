
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axiosConfig";
import { CheckCircle, Package, RefreshCw, XCircle } from "lucide-react";

interface CallbackState {
  processing: boolean;
  success: boolean | null;
  error: string | null;
  orderData: any;
}

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [state, setState] = useState<CallbackState>({
    processing: true,
    success: null,
    error: null,
    orderData: null,
  });

  /* -------------------------------------------
     Extract IDs from URL or storage
  ------------------------------------------- */
  const getIds = () => {
    const urlOrderId =
      searchParams.get("order_id") ||
      searchParams.get("orderId") ||
      searchParams.get("cf_order_id");

    const storedOrderId =
      sessionStorage.getItem("orderId") || localStorage.getItem("orderId");

    const orderId = urlOrderId || storedOrderId;

    const paymentId =
      searchParams.get("cf_payment_id") ||
      searchParams.get("payment_id") ||
      searchParams.get("paymentId");

    // ✅ Get cart type and internal order ID
    const cartType = sessionStorage.getItem("cartType") || "cart";
    const internalOrderId = sessionStorage.getItem("internalOrderId");

    return { orderId, paymentId, cartType, internalOrderId };
  };

  /* -------------------------------------------
     Main verifier with cart clearing logic
  ------------------------------------------- */
  const verifyPayment = useCallback(async () => {
  const { orderId, paymentId, cartType, internalOrderId } = getIds();

  if (!orderId) {
    setState({
      processing: false,
      success: false,
      error: "Order ID not found in callback.",
      orderData: null,
    });
    toast({
      title: "Order Not Detected",
      description: "We could not identify your order automatically. Please check your orders page.",
      variant: "destructive",
    });
    setTimeout(() => navigate("/orders"), 4000);
    return;
  }

  try {
    // ✅ Call backend verification
    const res = await axiosInstance.post("/cashfree/verify-callback", {
  orderId,
  paymentId,
  internalOrderId,
});

    console.log('🔍 Verification response:', res.data);

    // ✅ SIMPLIFIED: Check backend response directly
    if (res.data.success && res.data.paymentStatus === "SUCCESS") {
      // ✅ Payment verified as successful
      try {
        // Clear cart based on type
        if (cartType === "cart") {
          await axiosInstance.delete("/cart/clear");
        } else if (cartType === "hamper") {
          await axiosInstance.delete("/hamper/clear");
        }
      } catch (cartError) {
        console.warn("⚠️ Failed to clear cart:", cartError);
        // Don't fail the whole process if cart clearing fails
      }

      setState({
        processing: false,
        success: true,
        error: null,
        orderData: res.data.order,
      });

      toast({
        title: "Payment Successful 🎉",
        description: `Order #${res.data.order._id.slice(-6).toUpperCase()} confirmed.`,
        duration: 5000,
      });

      // Clear session storage
      ["orderId", "paymentMethod", "cartType", "internalOrderId"].forEach((k) => {
        sessionStorage.removeItem(k);
        localStorage.removeItem(k);
      });

      setTimeout(() => navigate("/orders"), 3000);
      
    } else {
      // ✅ Payment failed or verification failed
      setState({
        processing: false,
        success: false,
        error: res.data.message || `Payment failed with status: ${res.data.paymentStatus}`,
        orderData: res.data.order,
      });

      toast({
        title: "Payment Failed",
        description: "Your payment was not successful. Your cart is preserved for retry.",
        variant: "destructive",
        duration: 8000,
      });

      // DON'T clear session storage - preserve for retry
      setTimeout(() => navigate("/cart"), 4000);
    }

  } catch (err) {
    console.error("Payment verification error:", err);
    
    setState({
      processing: false,
      success: false,
      error: err.response?.data?.message || err.message || "Verification failed",
      orderData: null,
    });

    toast({
      title: "Verification Failed",
      description: "We couldn't verify your payment. If amount was debited, contact support.",
      variant: "destructive",
      duration: 8000,
    });

    setTimeout(() => navigate("/orders"), 6000);
  }
}, [navigate, toast, searchParams]);


  /* -------------------------------------------
     Run verifier once
  ------------------------------------------- */
  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  /* -------------------------------------------
     Enhanced UI with payment failure state
  ------------------------------------------- */
  const retry = () => {
    setState((s) => ({ ...s, processing: true, error: null }));
    verifyPayment();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white p-4">
      <div className="max-w-lg w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center">
        {/* Processing */}
        {state.processing && (
          <>
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin mx-auto"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Verifying Payment…
            </h2>
            <p className="text-gray-600 text-sm">
              Please don't close or refresh this page.
            </p>
          </>
        )}

        {/* Success */}
        {!state.processing && state.success === true && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Payment Successful!
            </h2>
            {state.orderData && (
              <p className="text-gray-700 mb-2">
                Order #{state.orderData._id?.slice(-6).toUpperCase()} – Amount ₹
                {state.orderData.totalAmount}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Redirecting you to "My Orders"…
            </p>
          </>
        )}

        {/* ✅ Enhanced Error/Failure State */}
        {!state.processing && state.success === false && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
              {state.error?.includes("Payment failed")
                ? "Payment Failed"
                : "Verification Failed"}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {state.error || "We couldn't verify your payment."}
            </p>
            <div className="space-y-3">
              {state.error?.includes("Payment failed") ? (
                <button
                  onClick={() => navigate("/cart")}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Return to Cart & Retry
                </button>
              ) : (
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Go to My Orders
                </button>
              )}
              <button
                onClick={retry}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
