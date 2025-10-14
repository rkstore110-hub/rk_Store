
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axiosConfig";
import { TokenManager } from "@/utils/tokenManager";
import { format, isValid } from "date-fns";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  CreditCard,
  Gift,
  User,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* Types */
type OrderState = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "failed";
type PayState = "initiated" | "pending" | "paid" | "failed";

interface OrderItem {
  _id?: string;
  productId: string | {
    _id?: string;
    Product_name?: string;
    name?: string;
    Product_image?: string[];
    image?: string;
  };
  name?: string;
  quantity: number;
  price: number;
  image?: string;
}

interface BackendOrder {
  _id: string;
  createdAt: string;
  status: OrderState;
  paymentStatus: PayState;
  paymentMethod: string;
  totalAmount: number;
  itemsTotal?: number;
  deliveryCharge?: number;
  items: OrderItem[];
  shippingAddress: Record<string, string>;
  isCustomHamper?: boolean;
  trackingNumber?: string;
}

interface DisplayOrder {
  _id: string;
  createdAt: string;
  orderStatus: OrderState;
  paymentStatus: PayState;
  paymentMethod: string;
  totalAmount: number;
  itemsTotal: number;
  deliveryCharge: number;
  itemThumb: string;
  itemCount: number;
  isCustomHamper?: boolean;
  trackingNumber?: string;
}

/* Updated pastel theme configs */
const orderStatus = {
  pending: { 
    icon: Clock, 
    variant: "secondary" as const, 
    label: "Order Placed", 
    progress: 25,
    bgColor: "bg-purple-50/80",
    textColor: "text-purple-700",
    borderColor: "border-purple-200"
  },
  processing: { 
    icon: Package, 
    variant: "default" as const, 
    label: "Processing", 
    progress: 50,
    bgColor: "bg-blue-50/80",
    textColor: "text-blue-700", 
    borderColor: "border-blue-200"
  },
  shipped: { 
    icon: Truck, 
    variant: "outline" as const, 
    label: "Shipped", 
    progress: 75,
    bgColor: "bg-pink-50/80",
    textColor: "text-pink-700",
    borderColor: "border-pink-200"
  },
  delivered: { 
    icon: CheckCircle, 
    variant: "default" as const, 
    label: "Delivered", 
    progress: 100,
    bgColor: "bg-green-50/80",
    textColor: "text-green-700",
    borderColor: "border-green-200"
  },
  cancelled: { 
    icon: XCircle, 
    variant: "destructive" as const, 
    label: "Cancelled", 
    progress: 0,
    bgColor: "bg-red-50/80",
    textColor: "text-red-700",
    borderColor: "border-red-200"
  },
  failed: { 
    icon: XCircle, 
    variant: "destructive" as const, 
    label: "Failed", 
    progress: 0,
    bgColor: "bg-red-50/80",
    textColor: "text-red-700",
    borderColor: "border-red-200"
  },
};

const payStatus = {
  initiated: { variant: "secondary" as const, label: "Initiated", color: "bg-purple-500" },
  pending: { variant: "outline" as const, label: "Pending", color: "bg-amber-500" },
  paid: { variant: "default" as const, label: "Paid", color: "bg-green-500" },
  failed: { variant: "destructive" as const, label: "Failed", color: "bg-red-500" },
};

const PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjgiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+";

const Orders = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const { toast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isValid(d) ? format(d, "MMM dd") : "—";
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return isValid(d) ? format(d, "h:mm a") : "";
  };

  /* Transform backend order to display format */
  const transformOrder = (o: BackendOrder): DisplayOrder => {
    const delivery = o.deliveryCharge ?? 80;
    const itemsTotal = o.itemsTotal ?? Math.max(0, o.totalAmount - delivery);
    
    const firstItem = o.items[0];
    let thumb = PLACEHOLDER;
    
    if (firstItem) {
      if (typeof firstItem.productId === "object" && firstItem.productId) {
        thumb = firstItem.productId.Product_image?.[0] || firstItem.productId.image || PLACEHOLDER;
      } else if (firstItem.image) {
        thumb = firstItem.image;
      }
    }

    return {
      _id: o._id,
      createdAt: o.createdAt,
      orderStatus: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      totalAmount: o.totalAmount,
      itemsTotal,
      deliveryCharge: delivery,
      itemThumb: thumb,
      itemCount: o.items.length,
      isCustomHamper: o.isCustomHamper,
      trackingNumber: o.trackingNumber,
    };
  };

  /* Fetch orders */
  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        if (!TokenManager.getToken("user")) throw new Error("Authentication required");
        
        const res = await axiosInstance.get(`/razorpay/my-orders/${userId}`);
        const list = res.data.orders as BackendOrder[];
        
        setOrders(
          list.map(transformOrder).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch (error: any) {
        toast({
          title: "Failed to load orders",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, toast]);

  /* Loading state */
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-white">
          <div className="px-2 pt-20 pb-8">
            <div className="max-w-sm mx-auto space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-purple-100/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-purple-100 rounded w-20" />
                        <div className="h-2 bg-purple-50 rounded w-24" />
                      </div>
                      <div className="h-5 bg-purple-100 rounded w-16" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-12 bg-purple-50 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  /* Not authenticated */
  if (!userId) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-white">
          <div className="px-2 pt-20 pb-8">
            <Card className="max-w-xs mx-auto text-center border-purple-100/50 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-4 px-4">
                <User className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                <h2 className="text-lg font-semibold mb-2 text-purple-900">Login Required</h2>
                <p className="text-purple-600 mb-4 text-sm">
                  Please log in to view orders.
                </p>
                <Button 
                  onClick={() => navigate("/login")} 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      {/* Pastel gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-white">
        <div className="px-2 pt-20 pb-8">
          <div className="max-w-sm mx-auto">
            {/* Header - optimized for 320px */}
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="mb-3 -ml-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Profile
              </Button>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                    My Orders
                  </h1>
                  <p className="text-sm text-purple-600">
                    {orders.length} order{orders.length !== 1 ? "s" : ""}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  disabled={loading}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Empty state */}
            {orders.length === 0 ? (
              <Card className="text-center py-8 border-purple-100/50 bg-white/80 backdrop-blur-sm">
                <CardContent>
                  <Package className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                  <h3 className="text-base font-semibold mb-2 text-purple-900">No Orders Yet</h3>
                  <p className="text-purple-600 mb-4 text-sm">
                    Start shopping to see orders here.
                  </p>
                  <Button 
                    onClick={() => navigate("/")} 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Orders list - Mobile optimized */
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const status = orderStatus[order.orderStatus];
                  const payment = payStatus[order.paymentStatus];
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className={`overflow-hidden border-purple-100/50 bg-white/90 backdrop-blur-sm ${status.borderColor}`}>
                        <CardHeader className="pb-2 px-3 pt-3">
                          <div className="flex items-center gap-2">
                            <div className={`flex-shrink-0 w-8 h-8 ${status.bgColor} rounded-lg flex items-center justify-center ${status.borderColor} border`}>
                              <StatusIcon className={`w-4 h-4 ${status.textColor}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className="font-semibold text-xs text-purple-900">
                                  #{order._id.slice(-6).toUpperCase()}
                                </span>
                                {order.isCustomHamper && (
                                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] px-1 py-0">
                                    <Gift className="w-2 h-2 mr-0.5" />
                                    Hamper
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-purple-500">
                                <span>{formatDate(order.createdAt)}</span>
                                <span>•</span>
                                <span>{formatTime(order.createdAt)}</span>
                              </div>
                            </div>
                            
                            <Badge 
                              variant={status.variant} 
                              className="text-[10px] px-2 py-0.5"
                            >
                              {status.label}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="px-3 pb-3 space-y-3">
                          {/* Order items preview */}
                          <div className="flex items-center gap-2">
                            <Avatar className="w-10 h-10 rounded-md border border-purple-100">
                              <AvatarImage 
                                src={order.itemThumb} 
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.src = PLACEHOLDER;
                                }}
                              />
                              <AvatarFallback className="rounded-md bg-purple-50">
                                <Package className="w-4 h-4 text-purple-400" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-purple-900">
                                {order.itemCount} item{order.itemCount > 1 ? "s" : ""}
                              </p>
                              <div className="text-[10px] text-purple-500">
                                Items ₹{order.itemsTotal.toFixed(2)} + Delivery ₹{order.deliveryCharge.toFixed(2)}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-bold text-sm bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                                ₹{order.totalAmount.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <Separator className="bg-purple-100/50" />

                          {/* Progress bar for active orders */}
                          {order.orderStatus !== "cancelled" && order.orderStatus !== "failed" && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-purple-600">
                                <span>Progress</span>
                                <span>{status.progress}%</span>
                              </div>
                              <Progress 
                                value={status.progress} 
                                className="h-1.5 bg-purple-100/50"
                              />
                            </div>
                          )}

                          {/* Payment info */}
                          <div className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-1 text-purple-600">
                              <CreditCard className="w-3 h-3" />
                              <span className="uppercase font-medium">
                                {order.paymentMethod}
                              </span>
                            </div>
                            
                            <Badge 
                              variant={payment.variant} 
                              className="text-[9px] px-1.5 py-0"
                            >
                              {payment.label}
                            </Badge>
                          </div>

                          {/* Tracking number */}
                          {order.trackingNumber && (
                            <div className="bg-purple-50/50 rounded-lg p-2 border border-purple-100/50">
                              <div className="flex items-center gap-1 text-[10px] text-purple-700">
                                <Truck className="w-3 h-3" />
                                <span className="font-medium">Tracking:</span>
                                <span className="font-mono text-[9px]">{order.trackingNumber}</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Orders;



