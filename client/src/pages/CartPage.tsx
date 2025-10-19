import React, { useState, useEffect } from "react";
import { useCart } from "../components/CartContext";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, Truck, Lock, Crown, Gem } from "lucide-react";

const CartPage = () => {
  const { cart, removeCart, clearCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: ""
  });

  const getProductId = (item: any) => item._id || item.id;
  const totalPrice = getCartTotal();
  const DELIVERY_CHARGE = 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (productId: number | string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeCart(productId);
      toast({ title: "Item removed", description: "Item has been removed from your cart", variant: "default" });
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleProductClick = (productId: number | string) => {
    const id = typeof productId === 'string' ? productId : productId.toString();
    navigate(`/product/${id}`);
  };

  const startCheckout = () => {
    if (!user) {
      toast({ title: "Please login", description: "You need to be logged in to checkout", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      toast({ title: "Cart is empty", description: "Add items to your cart before checkout", variant: "destructive" });
      return;
    }
    
    // Payment functionality disabled for now
    toast({ 
      title: "Checkout Temporarily Unavailable", 
      description: "Online payment and COD services are currently being upgraded. Please check back soon.", 
      variant: "default" 
    });
  };

  const getItemTotal = (item: any) => {
    if (!item || !item.price) return 0;
    const priceString = typeof item.price === 'string' ? item.price : String(item.price);
    const priceNumber = parseFloat(priceString.replace(/[^0-9.-]+/g, ""));
    if (isNaN(priceNumber)) return 0;
    const quantity = item.quantity || 1;
    return priceNumber * quantity;
  };

  const getItemUnitPrice = (item: any) => {
    if (!item || !item.price) return 0;
    const priceString = typeof item.price === 'string' ? item.price : String(item.price);
    const priceNumber = parseFloat(priceString.replace(/[^0-9.-]+/g, ""));
    return isNaN(priceNumber) ? 0 : priceNumber;
  };

  if (cart.length === 0) {
    return (
      <div 
        className="min-h-screen pt-20 pb-6 px-4 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 40%, #f3e8ff 100%)",
        }}
      >
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-purple-900 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-purple-600 mb-8 leading-relaxed">
            Discover our premium collection and add some exquisite pieces to your cart
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-purple-900 hover:bg-purple-800 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Explore Collections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="min-h-screen pt-20 pb-6 px-4 overflow-x-hidden"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 40%, #f3e8ff 100%)",
        }}
      >
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-purple-200">
              <Crown className="w-4 h-4" />
              RK Store Premium
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-purple-900 mb-2">
              Shopping Cart
            </h1>
            <p className="text-purple-600">
              Review your selected premium items
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <motion.div
                  key={`${getProductId(item)}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(250,245,255,.98) 60%, rgba(245,240,255,.98) 100%)",
                  }}
                >
                  <div className="p-4 flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div 
                      className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden cursor-pointer bg-gradient-to-br from-purple-50 to-white"
                      onClick={() => handleProductClick(getProductId(item))}
                    >
                      <img
                        src={item.image || (item.Product_image && item.Product_image[0]) || "/fallback.jpg"}
                        alt={item.name || item.Product_name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 
                          className="font-semibold text-purple-900 cursor-pointer hover:text-purple-700 transition-colors line-clamp-2"
                          onClick={() => handleProductClick(getProductId(item))}
                        >
                          {item.name || item.Product_name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCart(getProductId(item))}
                          className="h-8 w-8 rounded-full text-purple-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-purple-200 rounded-lg overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(getProductId(item), (item.quantity || 1) - 1)}
                              className="h-8 w-8 rounded-none text-purple-600 hover:bg-purple-100"
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="px-3 py-1 bg-white text-sm font-semibold text-purple-900 min-w-[40px] text-center">
                              {item.quantity || 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(getProductId(item), (item.quantity || 1) + 1)}
                              className="h-8 w-8 rounded-none text-purple-600 hover:bg-purple-100"
                            >
                              <Plus size={14} />
                            </Button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-900">
                              ₹{getItemTotal(item).toLocaleString()}
                            </div>
                            <div className="text-sm text-purple-500">
                              ₹{getItemUnitPrice(item).toLocaleString()} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-purple-200 shadow-xl p-6 sticky top-24"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(250,245,255,.98) 60%, rgba(245,240,255,.98) 100%)",
                }}
              >
                <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Gem className="w-5 h-5 text-purple-600" />
                  Order Summary
                </h2>

                {/* Calculation Section */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-600">Subtotal ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</span>
                    <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-600">Delivery Charge</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>

                  <div className="border-t border-purple-200 pt-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-purple-900">Total Amount</span>
                      <span className="text-purple-600">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full py-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={startCheckout}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>

                {/* Trust Indicators */}
                <div className="mt-4 space-y-2 text-xs text-purple-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span>Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span>Quality guarantee</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal - Removed payment functionality but kept structure */}
      <AnimatePresence>
        {isCheckingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsCheckingOut(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(250,245,255,.98) 60%, rgba(245,240,255,.98) 100%)",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Complete Your Order</h2>
                    <p className="text-purple-100 text-sm mt-1">
                      Premium shopping experience with RK Store
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                    onClick={() => setIsCheckingOut(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Order Summary */}
                <div className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-3 text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Order Summary ({cart.length} items)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between font-medium">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Delivery</span>
                      <span>FREE</span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-purple-700 pt-2 border-t border-purple-200">
                      <span>Total Amount</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Service Unavailable Message */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mb-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    Checkout Service Temporarily Unavailable
                  </h3>
                  <p className="text-amber-700 text-sm">
                    We're currently upgrading our payment systems to serve you better. 
                    Online payment and Cash on Delivery services will be available soon.
                  </p>
                </div>

                {/* Shipping Address Form - Kept for future use */}
                <div className="space-y-4 opacity-50 pointer-events-none">
                  <h3 className="font-semibold text-purple-900 text-lg">Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-purple-700">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleInputChange}
                        className="border-purple-300 focus:border-purple-400"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-purple-700">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        className="border-purple-300 focus:border-purple-400"
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address" className="text-purple-700">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleInputChange}
                        className="border-purple-300 focus:border-purple-400"
                        placeholder="Enter your complete address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-purple-700">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        className="border-purple-300 focus:border-purple-400"
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-purple-700">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        className="border-purple-300 focus:border-purple-400"
                        placeholder="Enter your state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pinCode" className="text-purple-700">PIN Code</Label>
                      <Input
                        id="pinCode"
                        name="pinCode"
                        value={shippingAddress.pinCode}
                        onChange={handleInputChange}
                        className="border-purple-300 focus:border-purple-400"
                        placeholder="Enter PIN code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Buttons - Disabled */}
              <div className="flex-shrink-0 bg-white border-t border-purple-200 p-6 space-y-3 rounded-b-2xl">
                <Button
                  disabled
                  className="w-full h-12 rounded-xl bg-gray-400 text-white font-semibold cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    Payment Services Coming Soon
                  </div>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartPage;
