
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/ui/use-toast";
import axiosInstance from "../utils/axiosConfig";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import  PhoneVerificationModal  from "../components/PhoneVerificationModal";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  X,
  ShoppingCart,
  Package,
  Gift,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Trash2,
  Eye,
  ShoppingBag,
  Truck,
  Grid3X3,
  List,
  ChevronUp,
  ChevronDown,
  Heart,
  Phone,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  RotateCcw,
  ArrowLeft,
  Lock,
  History, // NEW: Added for past orders icon
} from "lucide-react";

// Enhanced TypeScript declaration
interface CashfreeInstance {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget?: string;
  }) => Promise<{
    error?: { message: string };
    redirect?: boolean;
    paymentDetails?: any;
  }>;
}

declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => CashfreeInstance;
  }
}

// NEW: Interface for past hamper orders
interface PastHamperOrder {
  _id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  items: any[];
  paymentMethod: string;
}

export {};

const CustomHamperBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const justAddedItem = useRef(false);

  // Core hamper state
  const [hamperItems, setHamperItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Products state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");

  // UI state - UPDATED: Changed from "explore" | "hamper" to include "orders"
  const [activeTab, setActiveTab] = useState<"explore" | "hamper">("explore");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { checkoutLoading, processPayment } = usePaymentProcessing();
  const phoneVerification = usePhoneVerification();

  // Checkout form
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
  });

  // Constants
  const MINIMUM_HAMPER_AMOUNT = 350;
  const DELIVERY_CHARGE = totalAmount >= 500 ? 0 : 80;
  const minimumAmountGap = Math.max(0, MINIMUM_HAMPER_AMOUNT - totalAmount);
  const freeDeliveryGap = Math.max(0, 500 - totalAmount);


  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-switch to hamper tab when items are added (mobile only)
  useEffect(() => {
    if (
      isMobile &&
      hamperItems.length > 0 &&
      activeTab === "explore" &&
      justAddedItem.current
    ) {
      setTimeout(() => {
        setActiveTab("hamper");
        justAddedItem.current = false;
      }, 800);
    }
  }, [hamperItems.length, isMobile, activeTab]);

  // Fetch hamper-eligible products using backend filtering
  const fetchHamperProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        "api/getproducts?type=hamper&limit=100"
      );


      if (response.data && response.data.product) {
        const hamperProducts = response.data.product;
        setProducts(hamperProducts);
        setFilteredProducts(hamperProducts);

        const uniqueCategories = [
          ...new Set(
            hamperProducts
              .map(
                (p) =>
                  p.Product_category_name ||
                  p.Product_category?.category ||
                  "Uncategorized"
              )
              .filter(Boolean)
          ),
        ];
        setCategories(uniqueCategories);

      
        if (hamperProducts.length === 0) {
          toast({
            title: "No Hamper Products",
            description:
              "No products are currently available for custom hampers.",
            variant: "default",
          });
        }
      } else {
        setProducts([]);
        setFilteredProducts([]);
        setCategories([]);
      }
    } catch (error) {
      console.error("❌ Error fetching hamper products:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load hamper products";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch user's hamper from database
  const fetchUserHamper = useCallback(async () => {
    if (!user) return;

    try {
      const response = await axiosInstance.get("/hamper");
      const data = response.data;

      if (data.hamper && data.hamper.length > 0) {
        setHamperItems(data.hamper);
        setTotalAmount(data.totalAmount || 0);
        setTotalItems(data.totalItems || 0);
      } else {
        setHamperItems([]);
        setTotalAmount(0);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching hamper from database:", error);
      setHamperItems([]);
      setTotalAmount(0);
      setTotalItems(0);
    }
  }, [user]);

  // Initialize component
  useEffect(() => {
    fetchHamperProducts();
    fetchUserHamper();
  }, [fetchHamperProducts, fetchUserHamper]);

  // Add this effect after your existing useEffect hooks
useEffect(() => {
  if (phoneVerification.phoneVerified) {
    setShippingAddress(prev => ({
      ...prev,
      phone: phoneVerification.phoneNumber
    }));
    setIsCheckingOut(true);
  }
}, [phoneVerification.phoneVerified, phoneVerification.phoneNumber]);


  // Filter and search logic
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.Product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          (product.Product_category_name || product.Product_category) ===
          selectedCategory
      );
    }

    if (priceRange.min) {
      filtered = filtered.filter(
        (product) =>
          (product.Hamper_price || product.Product_price) >=
          parseFloat(priceRange.min)
      );
    }

    if (priceRange.max) {
      filtered = filtered.filter(
        (product) =>
          (product.Hamper_price || product.Product_price) <=
          parseFloat(priceRange.max)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (
            (a.Hamper_price || a.Product_price) -
            (b.Hamper_price || b.Product_price)
          );
        case "price-high":
          return (
            (b.Hamper_price || b.Product_price) -
            (a.Hamper_price || a.Product_price)
          );
        case "name":
        default:
          return a.Product_name.localeCompare(b.Product_name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  // Hamper validation
  const hamperValidation = useMemo(() => {
    if (totalAmount < MINIMUM_HAMPER_AMOUNT) {
      return {
        isValid: false,
        message: `Add ₹${minimumAmountGap} more to reach minimum hamper value of ₹${MINIMUM_HAMPER_AMOUNT}`,
      };
    }
    return { isValid: true, message: "Hamper is ready for checkout!" };
  }, [totalAmount, minimumAmountGap]);

  // Add item to hamper
  const addItemToHamper = async (product) => {
    try {
      setIsProcessing(true);
      justAddedItem.current = true;

      const response = await axiosInstance.post("/hamper/add", {
        productId: product._id,
        quantity: 1,
      });

      if (response.data) {
        setHamperItems(response.data.hamper);
        setTotalAmount(response.data.totalAmount);
        setTotalItems(response.data.totalItems);

        toast({
          title: "Added to Hamper",
          description: `${product.Product_name} added to your custom hamper`,
        });
      }
    } catch (error) {
      console.error("Error adding to hamper:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to add item to hamper",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Update item quantity in hamper
  const updateItemQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeItemFromHamper(productId);
    }

    try {
      setIsProcessing(true);
      const response = await axiosInstance.put(`/hamper/update/${productId}`, {
        quantity: newQuantity,
      });

      if (response.data) {
        setHamperItems(response.data.hamper);
        setTotalAmount(response.data.totalAmount);
        setTotalItems(response.data.totalItems);
      }
    } catch (error) {
      console.error("Error updating hamper quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove item from hamper
  const removeItemFromHamper = async (productId) => {
    try {
      setIsProcessing(true);
      const response = await axiosInstance.delete(
        `/hamper/remove/${productId}`
      );

      if (response.data) {
        setHamperItems(response.data.hamper);
        setTotalAmount(response.data.totalAmount);
        setTotalItems(response.data.totalItems);

        toast({
          title: "Item Removed",
          description: "Item removed from hamper",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error removing from hamper:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear entire hamper
  const clearHamper = async () => {
    try {
      setIsProcessing(true);
      await axiosInstance.delete("/hamper/clear");

      setHamperItems([]);
      setTotalAmount(0);
      setTotalItems(0);

      toast({
        title: "Hamper Cleared",
        description: "All items removed from hamper",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error clearing hamper:", error);
      toast({
        title: "Error",
        description: "Failed to clear hamper",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle tab change
  const handleTabChange = (newTab) => {
    if (newTab === "explore") justAddedItem.current = false;
    setActiveTab(newTab);
  };

  // Handle checkout form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Start checkout process - MODIFIED TO USE PHONE VERIFICATION
  const startCheckout = () => {
  if (!user) {
    toast({
      title: "Please login",
      description: "You need to be logged in to checkout",
      variant: "destructive",
    });
    navigate("/login");
    return;
  }
  
  if (!hamperValidation.isValid) {
    toast({
      title: "Cannot Proceed",
      description: hamperValidation.message,
      variant: "destructive",
    });
    return;
  }
  
  // ✅ Use hook method instead of inline state
  phoneVerification.setShowPhoneVerification(true);
};


  // ✅ Replace handlePaymentSelection with this
  const handlePaymentSelection = async (paymentMethod: "cod" | "online") => {
  try {
    // ✅ Add phone verification check
    if (!phoneVerification.phoneVerified) {
      toast({
        title: "Phone Not Verified",
        description: "Please verify your phone number first",
        variant: "destructive",
      });
      return;
    }

    // Form validation
    const requiredFields = ["fullName", "address", "city", "state", "pinCode", "phone"];
    const missingFields = requiredFields.filter(
      (field) => !shippingAddress[field].trim()
    );

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping address fields",
        variant: "destructive",
      });
      return;
    }

    // Prepare items for payment processing
    const orderItems = hamperItems.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.Hamper_price || item.productId.Product_price,
      name: item.productId.Product_name,
      image: item.productId.Product_image?.[0] || null,
    }));

    // Calculate totals
    const itemsTotal = hamperItems.reduce((total, item) => {
      return total + (item.productId.Hamper_price || item.productId.Product_price) * item.quantity;
    }, 0);

    const totals = {
      itemsTotal: itemsTotal,
      deliveryCharge: DELIVERY_CHARGE,
      totalAmount: itemsTotal + DELIVERY_CHARGE,
    };

    // ✅ Use the standardized payment processing with cartType: "hamper"
    const success = await processPayment(
      orderItems,
      shippingAddress,
      paymentMethod,
      totals,
      "hamper" // ✅ This is crucial for hamper orders
    );

    if (success) {
      // Reset local state since payment processing handles cart clearing
      setHamperItems([]);
      setTotalAmount(0);
      setTotalItems(0);
      setIsCheckingOut(false);
      phoneVerification.resetPhoneVerification(); // ✅ Use hook method
    }

  } catch (error: any) {
    console.error("❌ Hamper payment error:", error);
    toast({
      title: "Payment Error",
      description: error.message || "Failed to process hamper payment",
      variant: "destructive",
    });
  }
};

  // Helper functions
  const getItemTotal = (item) => {
    const price = item.productId.Hamper_price || item.productId.Product_price;
    return price * item.quantity;
  };

  const getItemUnitPrice = (item) => {
    return item.productId.Hamper_price || item.productId.Product_price;
  };

  const isProductInHamper = (productId) => {
    return hamperItems.some((item) => item.productId._id === productId);
  };

  const getProductQuantityInHamper = (productId) => {
    const item = hamperItems.find((item) => item.productId._id === productId);
    return item ? item.quantity : 0;
  };

  // NEW: Format date for past orders
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // NEW: Get status color and icon
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: "bg-amber-500", icon: Clock, label: "Pending" },
      processing: { color: "bg-blue-500", icon: Package, label: "Processing" },
      shipped: { color: "bg-purple-500", icon: Truck, label: "Shipped" },
      delivered: {
        color: "bg-green-500",
        icon: CheckCircle,
        label: "Delivered",
      },
      cancelled: { color: "bg-red-500", icon: X, label: "Cancelled" },
      failed: { color: "bg-red-500", icon: X, label: "Failed" },
    };
    return configs[status] || configs.pending;
  };

  // Compact Mobile Filters Component - KEEPING SECOND CODE STYLING
  const MobileFilters = () => (
    <motion.div
      initial={false}
      animate={{ height: showFilters ? "auto" : 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden bg-white border-b border-gray-200"
    >
      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 sm:pl-10 h-7 sm:h-9 text-[11px] xs:text-xs sm:text-sm"
          />
        </div>

        {/* Category and Sort in a row */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-7 sm:h-9 text-[10px] xs:text-xs sm:text-sm px-1.5 sm:px-3">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px] xs:text-xs">
                All
              </SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="text-[10px] xs:text-xs"
                >
                  {category.length > 15
                    ? category.substring(0, 15) + "..."
                    : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-7 sm:h-9 text-[10px] xs:text-xs sm:text-sm px-1.5 sm:px-3">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name" className="text-[10px] xs:text-xs">
                Name
              </SelectItem>
              <SelectItem value="price-low" className="text-[10px] xs:text-xs">
                Price ↑
              </SelectItem>
              <SelectItem value="price-high" className="text-[10px] xs:text-xs">
                Price ↓
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <Input
            type="number"
            placeholder="Min ₹"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, min: e.target.value }))
            }
            className="h-7 sm:h-9 text-[10px] xs:text-xs sm:text-sm px-1.5 sm:px-3"
          />
          <Input
            type="number"
            placeholder="Max ₹"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, max: e.target.value }))
            }
            className="h-7 sm:h-9 text-[10px] xs:text-xs sm:text-sm px-1.5 sm:px-3"
          />
        </div>
      </div>
    </motion.div>
  );

  // Product Card Component - KEEPING SECOND CODE STYLING
  // Enhanced Product Card Component - 320px Optimized
  const ProductCard = ({ product }) => {
    const hamperPrice = product.Hamper_price || product.Product_price;
    const regularPrice = product.Product_price;
    const discount =
      regularPrice > hamperPrice
        ? ((regularPrice - hamperPrice) / regularPrice) * 100
        : 0;

    const inHamper = isProductInHamper(product._id);
    const hamperQuantity = getProductQuantityInHamper(product._id);

    // Compact Quantity Control
    const QuantityControl = () => (
      <div className="flex items-center border border-gray-300 rounded-md bg-gray-50 overflow-hidden">
        <button
          className="w-5 h-5 xs:w-6 xs:h-6 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50"
          onClick={() => updateItemQuantity(product._id, hamperQuantity - 1)}
          disabled={isProcessing}
          aria-label="Decrease quantity"
        >
          <Minus className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-gray-600" />
        </button>
        <span className="w-5 xs:w-6 text-center text-[10px] xs:text-xs font-semibold bg-white leading-5 xs:leading-6">
          {hamperQuantity}
        </span>
        <button
          className="w-5 h-5 xs:w-6 xs:h-6 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50"
          onClick={() => updateItemQuantity(product._id, hamperQuantity + 1)}
          disabled={isProcessing}
          aria-label="Increase quantity"
        >
          <Plus className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-gray-600" />
        </button>
      </div>
    );

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/90 backdrop-blur-sm overflow-hidden h-full">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image Container - 320px Optimized */}
          <div className="relative overflow-hidden aspect-square">
            <img
              src={product.Product_image?.[0] || "/placeholder-product.jpg"}
              alt={product.Product_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-product.jpg";
              }}
            />

            {/* Enhanced Badges */}
            <div className="absolute top-1 left-1 right-1 flex justify-between items-start gap-1">
              {discount > 0 && (
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-[8px] xs:text-[10px] px-1 py-0.5 leading-tight shadow-sm">
                  {discount.toFixed(0)}% OFF
                </Badge>
              )}
              {inHamper && (
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[8px] xs:text-[10px] px-1 py-0.5 leading-tight shadow-sm">
                  <CheckCircle className="w-2 h-2 xs:w-2.5 xs:h-2.5 mr-0.5" />
                  <span className="hidden xs:inline">In Hamper</span>
                  <span className="xs:hidden">✓</span>
                </Badge>
              )}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>

          {/* Content - 320px Optimized */}
          <div className="p-1.5 xs:p-2 sm:p-3 space-y-1.5 flex-1 flex flex-col">
            {/* Product Name */}
            <h3 className="font-semibold text-[10px] xs:text-xs sm:text-sm line-clamp-2 min-h-[2rem] xs:min-h-[2.5rem] leading-tight text-gray-900">
              {product.Product_name}
            </h3>

            {/* Price Section */}
            <div className="space-y-1 flex-1">
              <div className="flex items-start justify-between gap-1">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs xs:text-sm sm:text-base font-bold text-green-600">
                    ₹{hamperPrice.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <span className="text-[8px] xs:text-xs text-gray-500 line-through">
                      ₹{regularPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Add/Quantity Controls */}
                <div className="flex-shrink-0">
                  {inHamper ? (
                    <QuantityControl />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItemToHamper(product)}
                      className="hover:bg-green-50 hover:border-green-500 hover:text-green-600 text-[8px] xs:text-xs px-1.5 py-0.5 h-6 xs:h-7 border-purple-200 transition-all duration-200 group/btn"
                      disabled={isProcessing}
                    >
                      <Plus className="h-2 w-2 xs:h-2.5 xs:w-2.5 mr-0.5 transition-transform group-hover/btn:scale-110" />
                      <span className="xs:inline">Add</span>
                      <span className="hidden xs:hidden">+</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Badge */}
            <Badge
              variant="secondary"
              className="text-[8px] xs:text-xs w-full justify-center truncate mt-auto bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors"
            >
              {product.Product_category_name ||
                product.Product_category ||
                "Uncategorized"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state - KEEPING SECOND CODE STYLING
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white px-2 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-lg font-medium">Loading hamper products...</p>
        </motion.div>
      </div>
    );
  }

  // Error state - KEEPING SECOND CODE STYLING
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white px-2 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Unable to Load Products
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchHamperProducts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  // Main render - KEEPING SECOND CODE STYLING BUT ADDING PHONE VERIFICATION MODAL
  return (
    <>
      <style>{`
  body, html {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
  * {
    box-sizing: border-box;
  }
  
  /* Enhanced 320px support */
  @media (max-width: 320px) {
    .container {
      padding-left: 2px;
      padding-right: 2px;
    }
    .hamper-card {
      padding: 6px !important;
    }
    .hamper-item-image {
      width: 48px !important;
      height: 48px !important;
    }
    .quantity-control-btn {
      width: 20px !important;
      height: 20px !important;
    }
    .quantity-display {
      width: 28px !important;
      font-size: 10px !important;
    }
    /* Product cards ultra-compact */
    .product-card-content {
      padding: 4px !important;
    }
    .product-card-image {
      min-height: 120px !important;
    }
  }
  
  /* Add xs breakpoint support */
  @media (min-width: 360px) {
    .xs\\:text-xs { font-size: 0.75rem; line-height: 1rem; }
    .xs\\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .xs\\:p-2 { padding: 0.5rem; }
    .xs\\:px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .xs\\:gap-2 { gap: 0.5rem; }
    .xs\\:w-12 { width: 3rem; }
    .xs\\:h-12 { height: 3rem; }
    .xs\\:leading-6 { line-height: 1.5rem; }
  }
  
  .xs\\:hidden {
    @media (max-width: 359px) {
      display: none;
    }
  }
  
  /* Line clamp utilities */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white pt-16 pb-6 px-1 overflow-x-hidden">
        <div className="container mx-auto max-w-6xl px-1">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-2 sm:mb-4 px-1"
          >
            <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              Custom <span className="text-purple-600">Hamper Builder</span>
            </h1>
            <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 leading-tight px-2">
              Create your perfect gift hamper • Min ₹{MINIMUM_HAMPER_AMOUNT}
            </p>
          </motion.div>

          {/* Hamper Status Banner */}
          {totalItems > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md sm:rounded-lg p-1.5 sm:p-3 mb-2 sm:mb-4 mx-1"
            >
              <div className="flex items-center justify-between text-[10px] xs:text-xs sm:text-sm">
                <div className="flex items-center gap-1 min-w-0">
                  <Gift className="w-3 h-3 flex-shrink-0" />
                  <span className="font-semibold truncate">
                    Hamper: {totalItems} • ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <Badge className="bg-white/20 text-white text-[9px] xs:text-xs px-1 py-0.5 ml-1 flex-shrink-0">
                  {hamperValidation.isValid ? "Ready!" : `₹${minimumAmountGap}`}
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Tab Interface */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full mx-1"
          >
            {/* Tab Navigation */}
            <div className="bg-white rounded-t-md sm:rounded-t-xl shadow-lg border border-b-0 border-purple-100">
              <TabsList className="w-full h-10 sm:h-12 bg-transparent p-0.5 sm:p-1">
                <TabsTrigger
                  value="explore"
                  className="flex-1 h-9 sm:h-10 text-[10px] xs:text-xs sm:text-sm font-medium data-[state=active]:bg-purple-600 data-[state=active]:text-white px-1 sm:px-2"
                >
                  <Grid3X3 className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-0.5 xs:mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden xs:inline">Explore</span>
                  <span className="xs:hidden">Shop</span>
                  <Badge className="ml-0.5 xs:ml-1 sm:ml-2 text-[8px] xs:text-xs bg-purple-100 text-purple-700 px-1 py-0">
                    {filteredProducts.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="hamper"
                  className="flex-1 h-9 sm:h-10 text-[10px] xs:text-xs sm:text-sm font-medium data-[state=active]:bg-purple-600 data-[state=active]:text-white px-1 sm:px-2"
                >
                  <ShoppingBag className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-0.5 xs:mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden xs:inline">Hamper</span>
                  <span className="xs:hidden">Cart</span>
                  {totalItems > 0 && (
                    <Badge className="ml-0.5 xs:ml-1 sm:ml-2 text-[8px] xs:text-xs bg-orange-500 text-white px-1 py-0">
                      {totalItems}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Mobile Filter Toggle */}
              {activeTab === "explore" && isMobile && (
                <div className="border-t border-gray-200">
                  <Button
                    variant="ghost"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full h-8 sm:h-10 justify-between text-[11px] xs:text-xs sm:text-sm text-gray-600 hover:bg-purple-50 px-2"
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Filters & Search</span>
                      <span className="xs:hidden">Filters</span>
                    </div>
                    {showFilters ? (
                      <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </Button>
                </div>
              )}

              {/* Mobile Filters */}
              {activeTab === "explore" && isMobile && <MobileFilters />}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-md sm:rounded-b-xl shadow-lg border border-t-0 border-purple-100 min-h-[60vh]">
              {/* Explore Products Tab */}
              <TabsContent value="explore" className="m-0 p-0 w-full">
                {/* Enhanced Explore Tab - Mobile First Design */}
                <div className="bg-gradient-to-br from-purple-50 to-white p-1 sm:p-3 overflow-x-hidden min-h-[60vh]">
                  <div className="container mx-auto max-w-6xl">
                    {/* Enhanced Desktop Filters */}
                    {!isMobile && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Search */}
                          <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <Input
                              type="text"
                              placeholder="Search products..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 h-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                            />
                          </div>

                          {/* Category */}
                          <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger className="h-10 border-purple-200 focus:border-purple-500 rounded-lg">
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All Categories
                              </SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Sort */}
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-10 border-purple-200 focus:border-purple-500 rounded-lg">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name A-Z</SelectItem>
                              <SelectItem value="price-low">
                                Price: Low to High
                              </SelectItem>
                              <SelectItem value="price-high">
                                Price: High to Low
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Price Range */}
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Min ₹"
                              value={priceRange.min}
                              onChange={(e) =>
                                setPriceRange((prev) => ({
                                  ...prev,
                                  min: e.target.value,
                                }))
                              }
                              className="h-10 border-purple-200 focus:border-purple-500 rounded-lg"
                            />
                            <Input
                              type="number"
                              placeholder="Max ₹"
                              value={priceRange.max}
                              onChange={(e) =>
                                setPriceRange((prev) => ({
                                  ...prev,
                                  max: e.target.value,
                                }))
                              }
                              className="h-10 border-purple-200 focus:border-purple-500 rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Active Filters Display */}
                        {(searchQuery ||
                          selectedCategory !== "all" ||
                          priceRange.min ||
                          priceRange.max ||
                          sortBy !== "name") && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs font-medium text-gray-600">
                              Active filters:
                            </span>
                            {searchQuery && (
                              <Badge variant="secondary" className="text-xs">
                                Search: {searchQuery}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer"
                                  onClick={() => setSearchQuery("")}
                                />
                              </Badge>
                            )}
                            {selectedCategory !== "all" && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedCategory}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer"
                                  onClick={() => setSelectedCategory("all")}
                                />
                              </Badge>
                            )}
                            {(priceRange.min || priceRange.max) && (
                              <Badge variant="secondary" className="text-xs">
                                ₹{priceRange.min || "0"} - ₹
                                {priceRange.max || "∞"}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer"
                                  onClick={() =>
                                    setPriceRange({ min: "", max: "" })
                                  }
                                />
                              </Badge>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {filteredProducts.length} Product
                          {filteredProducts.length !== 1 ? "s" : ""}
                        </h3>
                        {searchQuery && (
                          <span className="text-xs text-gray-500">
                            for "{searchQuery}"
                          </span>
                        )}
                      </div>

                      {/* Quick Sort on Mobile */}
                      {isMobile && (
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-24 h-8 text-xs border-purple-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name" className="text-xs">
                              A-Z
                            </SelectItem>
                            <SelectItem value="price-low" className="text-xs">
                              ₹ ↑
                            </SelectItem>
                            <SelectItem value="price-high" className="text-xs">
                              ₹ ↓
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Enhanced Products Grid - 320px Optimized */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2 lg:gap-3">
                      {filteredProducts.map((product, index) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Enhanced Empty State */}
                    {filteredProducts.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8 sm:py-12 px-2"
                      >
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-purple-100 max-w-md mx-auto">
                          <Package className="h-12 w-12 sm:h-16 sm:w-16 text-purple-400 mx-auto mb-4" />
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            No Products Found
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {searchQuery
                              ? `No products match "${searchQuery}"`
                              : "Try adjusting your filters to see more products"}
                          </p>

                          {/* Quick Reset Filters */}
                          {(searchQuery ||
                            selectedCategory !== "all" ||
                            priceRange.min ||
                            priceRange.max) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("all");
                                setPriceRange({ min: "", max: "" });
                                setSortBy("name");
                              }}
                              className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Clear All Filters
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Load More Button (if you have pagination) */}
                    {filteredProducts.length > 0 &&
                      filteredProducts.length % 20 === 0 && (
                        <div className="text-center mt-6">
                          <Button
                            variant="outline"
                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Load More Products
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              </TabsContent>

              {/* Hamper Tab */}
              <TabsContent
                value="hamper"
                className="m-0 p-1 xs:p-2 sm:p-4 w-full"
              >
                {/* identical global style block to CartPage */}
                <style>{`
    body, html { overflow-x: hidden !important; max-width: 100vw !important; }
    * { box-sizing: border-box; }
    @media (max-width: 375px) {
      .container { padding-left: 8px; padding-right: 8px; }
    }
  `}</style>

                <div className="bg-gradient-to-br from-purple-50 to-white p-1 xs:p-2 sm:p-4 overflow-x-hidden min-h-[60vh]">
                  <div className="container mx-auto max-w-6xl">
                    {/* empty-hamper state */}
                    {hamperItems.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 px-2">
                        <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                          Your hamper is empty
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-6">
                          Start building your custom hamper by adding products
                        </p>
                        <Button
                          onClick={() => setActiveTab("explore")}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Grid3X3 className="w-4 h-4 mr-2" />
                          Explore Products
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* free-delivery banner */}
                        {freeDeliveryGap > 0 && freeDeliveryGap <= 300 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4"
                          >
                            <div className="flex items-center justify-center gap-1 sm:gap-2 text-orange-700 text-xs sm:text-sm">
                              <Truck className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="font-semibold text-center">
                                Add ₹{freeDeliveryGap} more for{" "}
                                <span className="text-orange-800 font-bold">
                                  FREE DELIVERY
                                </span>
                              </span>
                            </div>
                          </motion.div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                          {/* ───── LEFT PANE – item list ───── */}
                          <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg sm:rounded-xl shadow-xl border border-purple-100 p-2 sm:p-3 md:p-4">
                              <div className="space-y-2 sm:space-y-3">
                                {hamperItems.map((item, index) => (
                                  <motion.div
                                    key={`${item.productId._id}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-all duration-200"
                                  >
                                    {/* image */}
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0">
                                      <img
                                        src={
                                          item.productId.Product_image?.[0] ||
                                          "/placeholder-product.jpg"
                                        }
                                        alt={item.productId.Product_name}
                                        className="w-full h-full object-cover rounded-md"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            "/placeholder-product.jpg";
                                        }}
                                      />
                                    </div>

                                    {/* info */}
                                    <div className="flex-grow min-w-0">
                                      <div className="space-y-1 sm:space-y-2">
                                        {/* name */}
                                        <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
                                          {item.productId.Product_name}
                                        </h3>

                                        {/* price / qty / total */}
                                        <div className="space-y-1">
                                          {/* unit price */}
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] sm:text-xs text-gray-500">
                                              Unit Price:
                                            </span>
                                            <span className="text-xs sm:text-sm font-medium text-purple-600">
                                              ₹
                                              {getItemUnitPrice(
                                                item
                                              ).toLocaleString()}
                                            </span>
                                          </div>

                                          {/* qty controls + line total */}
                                          <div className="flex items-center justify-between gap-2">
                                            {/* qty controls */}
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] sm:text-xs text-gray-500">
                                                Qty:
                                              </span>
                                              <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                                                <button
                                                  className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-l-md hover:bg-gray-200"
                                                  onClick={() =>
                                                    updateItemQuantity(
                                                      item.productId._id,
                                                      item.quantity - 1
                                                    )
                                                  }
                                                  disabled={isProcessing}
                                                >
                                                  <Minus className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                                </button>
                                                <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">
                                                  {item.quantity}
                                                </span>
                                                <button
                                                  className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-r-md hover:bg-gray-200"
                                                  onClick={() =>
                                                    updateItemQuantity(
                                                      item.productId._id,
                                                      item.quantity + 1
                                                    )
                                                  }
                                                  disabled={isProcessing}
                                                >
                                                  <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                                </button>
                                              </div>
                                            </div>

                                            {/* line total */}
                                            <div className="flex flex-col items-end">
                                              <span className="text-[10px] sm:text-xs text-gray-500">
                                                Total:
                                              </span>
                                              <span className="text-sm sm:text-lg font-bold text-purple-700">
                                                ₹
                                                {getItemTotal(
                                                  item
                                                ).toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* remove */}
                                        <div className="flex justify-end pt-1">
                                          <button
                                            className="flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs text-red-500 hover:bg-red-50 rounded-md"
                                            onClick={() =>
                                              removeItemFromHamper(
                                                item.productId._id
                                              )
                                            }
                                            disabled={isProcessing}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            <span className="hidden sm:inline">
                                              Remove
                                            </span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>

                              {/* bottom buttons */}
                              <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 space-y-2">
                                <Button
                                  variant="outline"
                                  className="w-full rounded-full px-3 py-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-xs sm:text-sm"
                                  onClick={() => setActiveTab("explore")}
                                >
                                  Continue Adding Products
                                </Button>

                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    variant="destructive"
                                    className="flex-1 rounded-full px-3 py-2 text-xs sm:text-sm"
                                    onClick={clearHamper}
                                    disabled={isProcessing}
                                  >
                                    Clear Hamper
                                  </Button>
                                  <Button
                                    className={`flex-1 rounded-full px-3 py-2 text-xs sm:text-sm font-semibold ${
                                      hamperValidation.isValid
                                        ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                                        : "bg-gray-400 cursor-not-allowed"
                                    }`}
                                    onClick={startCheckout}
                                    disabled={
                                      !hamperValidation.isValid || isProcessing
                                    }
                                  >
                                    {hamperValidation.isValid
                                      ? "Checkout"
                                      : `Add ₹${minimumAmountGap} More`}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ───── RIGHT PANE – hamper summary ───── */}
                          <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg sm:rounded-xl shadow-xl border border-purple-100 p-3 sm:p-4 sticky top-20">
                              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                                Hamper Summary
                              </h2>

                              {/* item list */}
                              <div className="space-y-1.5 mb-4 max-h-32 sm:max-h-40 overflow-y-auto">
                                {hamperItems.map((item, index) => (
                                  <div
                                    key={`summary-${item.productId._id}-${index}`}
                                    className="flex justify-between items-start text-xs sm:text-sm py-1"
                                  >
                                    <div className="flex-1 min-w-0 mr-2">
                                      <div className="font-medium text-gray-700 truncate leading-tight">
                                        {item.productId.Product_name}
                                      </div>
                                      <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                        ₹
                                        {getItemUnitPrice(
                                          item
                                        ).toLocaleString()}{" "}
                                        × {item.quantity}
                                      </div>
                                    </div>
                                    <div className="font-semibold text-purple-600 flex-shrink-0">
                                      ₹{getItemTotal(item).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* calculations */}
                              <div className="border-t border-gray-200 pt-3 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">
                                    Subtotal ({totalItems} items)
                                  </span>
                                  <span className="font-semibold">
                                    ₹{totalAmount.toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">
                                    Delivery Charge
                                  </span>
                                  <span
                                    className={`font-semibold ${
                                      DELIVERY_CHARGE > 0
                                        ? "text-orange-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {DELIVERY_CHARGE > 0
                                      ? `₹${DELIVERY_CHARGE}`
                                      : "FREE"}
                                  </span>
                                </div>

                              

                                {/* minimum-amount progress */}
                                {!hamperValidation.isValid && (
                                  <div className="py-2 px-3 bg-red-50 rounded-lg border border-red-100">
                                    <div className="flex items-center justify-between text-xs text-red-700 mb-1">
                                      <span className="font-medium">
                                        Minimum Amount Progress
                                      </span>
                                      <span className="font-bold">
                                        ₹{minimumAmountGap} more
                                      </span>
                                    </div>
                                    <div className="bg-red-200 h-2 rounded-full relative overflow-hidden">
                                      <div
                                        className="bg-gradient-to-r from-red-400 to-red-500 h-full rounded-full transition-all duration-500"
                                        style={{
                                          width: `${Math.min(
                                            (totalAmount /
                                              MINIMUM_HAMPER_AMOUNT) *
                                              100,
                                            100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                    <div className="text-[10px] text-red-600 mt-1 text-center">
                                      {Math.round(
                                        (totalAmount / MINIMUM_HAMPER_AMOUNT) *
                                          100
                                      )}
                                      % towards minimum
                                    </div>
                                  </div>
                                )}

                                {/* grand total */}
                                <div className="flex justify-between items-center text-base sm:text-lg font-bold pt-2 border-t border-gray-200 bg-purple-50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 rounded-b-lg">
                                  <span className="text-gray-900">
                                    Total Amount
                                  </span>
                                  <span className="text-purple-700">
                                    ₹
                                    {(
                                      totalAmount + DELIVERY_CHARGE
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* checkout button */}
                              <Button
                                className={`w-full mt-4 rounded-full py-2 sm:py-3 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
                                  hamperValidation.isValid
                                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                    : "bg-gray-400 cursor-not-allowed"
                                }`}
                                onClick={startCheckout}
                                disabled={
                                  !hamperValidation.isValid || isProcessing
                                }
                              >
                                {hamperValidation.isValid
                                  ? "Proceed to Checkout"
                                  : `Add ₹${minimumAmountGap} More`}
                              </Button>

                              {/* validation message */}
                              <div className="mt-3 text-center">
                                <div
                                  className={`text-xs px-3 py-2 rounded-xl font-medium ${
                                    hamperValidation.isValid
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : "bg-red-100 text-red-800 border border-red-200"
                                  }`}
                                >
                                  {hamperValidation.message}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Rest of your existing modals (Checkout Modal, Phone Verification Modal) remain the same */}
        {/* Checkout Modal - KEEPING SECOND CODE STYLING */}
        <AnimatePresence>
          {isCheckingOut && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center overflow-hidden p-2"
              onClick={() => !checkoutLoading && setIsCheckingOut(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: "100%", scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: "100%", scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 500 }}
                className="bg-white w-full max-w-[95vw] sm:max-w-md mx-auto rounded-t-2xl sm:rounded-2xl shadow-2xl border-t border-purple-100 sm:border max-h-[95vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="relative flex-shrink-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 sm:px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold">
                        Checkout Custom Hamper
                      </h2>
                      <p className="text-xs sm:text-sm text-purple-100 mt-0.5">
                        Total: ₹
                        {(totalAmount + DELIVERY_CHARGE).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-white/20 text-white flex-shrink-0"
                      onClick={() =>
                        !checkoutLoading && setIsCheckingOut(false)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3">
                  {/* Compact Hamper Summary */}
                  <div className="bg-purple-50 rounded-lg p-3 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      Custom Hamper ({totalItems} items)
                    </h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium border-b border-purple-200 pb-1">
                        <span>Hamper Total</span>
                        <span>₹{totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-orange-600">
                        <span>Delivery</span>
                        <span>
                          FREE
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-purple-700 pt-1">
                        <span>Total Amount</span>
                        <span>
                          ₹{(totalAmount ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  {/* <form onSubmit={handleHamperCheckout} className="space-y-3"> */}
                   
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <Label
                          htmlFor="fullName"
                          className="text-xs font-medium text-gray-700"
                        >
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="Enter your full name"
                          value={shippingAddress.fullName}
                          onChange={handleInputChange}
                          required
                          className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label
                          htmlFor="phone"
                          className="text-xs font-medium text-gray-700"
                        >
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={shippingAddress.phone}
                          onChange={handleInputChange}
                          required
                          className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label
                          htmlFor="address"
                          className="text-xs font-medium text-gray-700"
                        >
                          Address *
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="Enter your address"
                          value={shippingAddress.address}
                          onChange={handleInputChange}
                          required
                          className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label
                            htmlFor="city"
                            className="text-xs font-medium text-gray-700"
                          >
                            City *
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            placeholder="City"
                            value={shippingAddress.city}
                            onChange={handleInputChange}
                            required
                            className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor="state"
                            className="text-xs font-medium text-gray-700"
                          >
                            State *
                          </Label>
                          <Input
                            id="state"
                            name="state"
                            placeholder="State"
                            value={shippingAddress.state}
                            onChange={handleInputChange}
                            required
                            className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label
                          htmlFor="pinCode"
                          className="text-xs font-medium text-gray-700"
                        >
                          PIN Code *
                        </Label>
                        <Input
                          id="pinCode"
                          name="pinCode"
                          placeholder="PIN Code"
                          value={shippingAddress.pinCode}
                          onChange={handleInputChange}
                          required
                          className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  {/* </form> */}
                </div>

                {/* Fixed Bottom - NEW PAYMENT BUTTONS */}
                <div className="flex-shrink-0 bg-white border-t border-gray-100 p-3 space-y-3">
                  {/* Payment Buttons */}
                  <div className="space-y-2">
                    {/* Pay Online Button */}
                    <Button
                      onClick={() => handlePaymentSelection("online")}
                      disabled={checkoutLoading}
                      className="w-full h-10 text-sm rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {checkoutLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4" />
                          Pay Online - ₹
                          {(totalAmount + DELIVERY_CHARGE).toLocaleString()}
                        </div>
                      )}
                    </Button>

                    {/* Cash on Delivery Button */}
                    <Button
                      onClick={() => handlePaymentSelection("cod")}
                      disabled={checkoutLoading}
                      variant="outline"
                      className="w-full h-10 text-sm rounded-full border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {checkoutLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Truck className="w-4 h-4" />
                          Cash on Delivery - ₹
                          {(totalAmount + DELIVERY_CHARGE).toLocaleString()}
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Payment Security Info */}
                  <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span>UPI • Cards • Net Banking • COD Available</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phone Verification Modal - PROFESSIONAL VERSION */}
        <AnimatePresence>
          {phoneVerification.showPhoneVerification && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
              onClick={() =>
                !phoneVerification.isVerifyingPhone && !phoneVerification.isVerifyingOTP && phoneVerification.resetPhoneVerification()
              }
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                className="bg-white w-full max-w-sm mx-auto rounded-3xl shadow-2xl border border-gray-100 max-h-[96vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Compact Header */}
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white px-4 py-5 sm:px-6 sm:py-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                        {!phoneVerification.showOTPInput ? (
                          <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold mb-0.5 tracking-tight leading-tight">
                          {!phoneVerification.showOTPInput ? "Verify Phone" : "Enter Code"}
                        </h2>
                        <p className="text-white/80 text-xs sm:text-sm font-medium">
                          {!phoneVerification.showOTPInput ? "Secure checkout" : "Almost done"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-white/10 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 flex-shrink-0"
                      onClick={() =>
                        !phoneVerification.isVerifyingPhone &&
                        !phoneVerification.isVerifyingOTP &&
                        phoneVerification.resetPhoneVerification()
                      }
                      disabled={phoneVerification.isVerifyingPhone || phoneVerification.isVerifyingOTP}
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>

                {/* Optimized Content */}
                <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                  {!phoneVerification.showOTPInput ? (
                    // Phone Number Input - Mobile Optimized
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                          <Phone className="w-8 h-8 sm:w-9 sm:h-9 text-blue-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">
                          Enter Mobile Number
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed px-2">
                          We'll verify your number for secure checkout
                        </p>
                      </div>

                      <form
                        onSubmit={phoneVerification.handlePhoneVerification}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="phoneVerification.phoneNumber"
                            className="text-sm font-semibold text-gray-800 flex items-center gap-2"
                          >
                            <Phone className="w-4 h-4 text-blue-600" />
                            Mobile Number *
                          </Label>
                          <div className="relative group">
                            <Input
                              id="phoneVerification.phoneNumber"
                              type="tel"
                              placeholder="Enter 10-digit mobile number"
                              value={phoneVerification.phoneNumber}
                              onChange={(e) => {
                                const value = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 10);
                                phoneVerification.setPhoneNumber(value);
                              }}
                              required
                              className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 rounded-2xl transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 text-center tracking-wide font-medium"
                              maxLength={10}
                            />
                            {phoneVerification.phoneNumber.length === 10 && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          {phoneVerification.phoneNumber && phoneVerification.phoneNumber.length !== 10 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="bg-red-50 border border-red-200 rounded-xl p-3"
                            >
                              <p className="text-red-600 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Please enter all 10 digits</span>
                              </p>
                            </motion.div>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={
                            phoneVerification.isVerifyingPhone || phoneVerification.phoneNumber.length !== 10
                          }
                          className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {phoneVerification.isVerifyingPhone ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Verifying...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Shield className="w-5 h-5" />
                              <span>Send Verification Code</span>
                            </div>
                          )}
                        </Button>

                        {/* Trust Badges - Mobile Optimized */}
                        <div className="flex items-center justify-center gap-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Secure</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Fast</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Private</span>
                          </div>
                        </div>
                      </form>
                    </div>
                  ) : (
                    // OTP Input - Mobile Optimized
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-emerald-50 to-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                          <MessageSquare className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">
                          Enter Verification Code
                        </h3>
                        <p className="text-gray-600 mb-3 text-sm leading-relaxed px-2">
                          4-digit code sent to your mobile
                        </p>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-2xl border border-gray-200 inline-block">
                          <p className="font-bold text-gray-800 text-base">
                            {phoneVerification.phoneNumber.replace(/(\d{5})(\d{5})/, "$1-$2")}
                          </p>
                        </div>
                      </div>

                      <form
                        onSubmit={phoneVerification.handleOTPVerification}
                        className="space-y-5"
                      >
                        <div className="space-y-3">
                          <Label
                            htmlFor="phoneVerification.otp"
                            className="text-sm font-semibold text-gray-800 flex items-center gap-2 justify-center"
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            Verification Code *
                          </Label>

                          {/* Mobile-Optimized OTP Input */}
                          <div className="flex justify-center gap-2 sm:gap-3">
                            {[...Array(4)].map((_, index) => (
                              <input
                                key={index}
                                ref={(el) => {
                                  otpInputRefs.current[index] = el;
                                }}
                                type="text"
                                value={phoneVerification.otp[index] || ""}
                                onChange={(e) => {
                                  const value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 1);
                                  const newOtp = phoneVerification.otp.split("");
                                  newOtp[index] = value;
                                  const updatedOtp = newOtp
                                    .join("")
                                    .slice(0, 4);
                                  phoneVerification.setOtp(updatedOtp);

                                  // Auto-focus next input
                                  if (
                                    value &&
                                    index < 3 &&
                                    otpInputRefs.current[index + 1]
                                  ) {
                                    otpInputRefs.current[index + 1]?.focus();
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Backspace" &&
                                    !phoneVerification.otp[index] &&
                                    index > 0 &&
                                    otpInputRefs.current[index - 1]
                                  ) {
                                    otpInputRefs.current[index - 1]?.focus();
                                  }
                                }}
                                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200"
                                maxLength={1}
                                inputMode="numeric"
                              />
                            ))}
                          </div>

                          {phoneVerification.otp && phoneVerification.otp.length > 0 && phoneVerification.otp.length !== 4 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="bg-amber-50 border border-amber-200 rounded-xl p-3"
                            >
                              <p className="text-amber-700 text-sm flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>{4 - phoneVerification.otp.length} more digits needed</span>
                              </p>
                            </motion.div>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={phoneVerification.isVerifyingOTP || phoneVerification.otp.length !== 4}
                          className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        >
                          {phoneVerification.isVerifyingOTP ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Verifying...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              <span>Complete Verification</span>
                            </div>
                          )}
                        </Button>

                        {/* Mobile-Optimized Resend Section */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                          <div className="text-center space-y-3">
                            {phoneVerification.otpTimer > 0 ? (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  Didn't receive the code?
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-semibold text-blue-600">
                                    Resend in {phoneVerification.otpTimer}s
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                  Didn't receive the code?
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={phoneVerification.handleResendOTP}
                                    disabled={phoneVerification.isVerifyingPhone}
                                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 font-semibold rounded-xl"
                                  >
                                    {phoneVerification.isVerifyingPhone ? (
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Sending...</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Resend Code</span>
                                      </div>
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      phoneVerification.setShowOTPInput(false);
                                      phoneVerification.setOtp("");
                                    }}
                                    className="text-gray-600 border-gray-200 hover:bg-gray-50 rounded-xl"
                                  >
                                    <ArrowLeft className="w-3 h-3 mr-1" />
                                    <span>Change Number</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* Compact Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>Secure & encrypted</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* // Add this before your closing fragment (</>) at the end of your JSX */}
<PhoneVerificationModal
  showPhoneVerification={phoneVerification.showPhoneVerification}
  phoneNumber={phoneVerification.phoneNumber}
  setPhoneNumber={phoneVerification.setPhoneNumber}
  otp={phoneVerification.otp}
  setOtp={phoneVerification.setOtp}
  otpInputRefs={phoneVerification.otpInputRefs}
  otpTimer={phoneVerification.otpTimer}
  showOTPInput={phoneVerification.showOTPInput}
  setShowOTPInput={phoneVerification.setShowOTPInput}
  isVerifyingPhone={phoneVerification.isVerifyingPhone}
  isVerifyingOTP={phoneVerification.isVerifyingOTP}
  handlePhoneVerification={phoneVerification.handlePhoneVerification}
  handleOTPVerification={phoneVerification.handleOTPVerification}
  handleResendOTP={phoneVerification.handleResendOTP}
  resetPhoneVerification={phoneVerification.resetPhoneVerification}
/>
    </>
  );
};

export default CustomHamperBuilder;
