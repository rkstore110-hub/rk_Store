// // Dashboard.tsx - Enhanced with comprehensive null checking
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Loader2, ShoppingCart, Package, Users } from "lucide-react";

// const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

// interface User {
//   _id: string;
//   firstName: string;
//   email: string;
//   role: string;
//   createdAt: string;
// }

// interface Order {
//   _id: string;
//   userId: {
//     _id: string;
//     firstName: string;
//     email: string;
//   } | null; // ✅ Make userId nullable
//   items: Array<{
//     productId: string;
//     quantity: number;
//     price: number;
//   }>;
//   totalAmount: number;
//   status: string;
//   createdAt: string;
// }

// interface CartItem {
//   userId: {
//     _id: string;
//     firstName: string;
//     email: string;
//   } | null; // ✅ Make userId nullable
//   items: Array<{
//     productId: {
//       Product_name: string;
//       Product_price: number;
//     } | null; // ✅ Make productId nullable too
//     quantity: number;
//   }>;
//   updatedAt: string;
// }

// export default function Dashboard() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [carts, setCarts] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const adminToken = localStorage.getItem("admin_token");
      
//       if (!adminToken) {
//         throw new Error("No admin token found");
//       }

//       const headers = {
//         Authorization: `Bearer ${adminToken}`,
//         'Content-Type': 'application/json'
//       };

//       const [usersRes, ordersRes, cartsRes] = await Promise.all([
//         axios.get(`${API_URL}/admin/users`, { headers }),
//         axios.get(`${API_URL}/admin/orders`, { headers }),
//         axios.get(`${API_URL}/admin/carts`, { headers }),
//       ]);

//       // ✅ Enhanced data validation and filtering
//       const validUsers = Array.isArray(usersRes.data.users) 
//         ? usersRes.data.users.filter((user: any) => user && user._id && user.firstName) 
//         : [];
      
//       const validOrders = Array.isArray(ordersRes.data.orders) 
//         ? ordersRes.data.orders.filter((order: any) => order && order._id)
//         : [];
      
//       const validCarts = Array.isArray(cartsRes.data.carts) 
//         ? cartsRes.data.carts.filter((cart: any) => cart && cart.userId)
//         : [];

//       console.log('✅ Dashboard data loaded:', {
//         users: validUsers.length,
//         orders: validOrders.length,
//         carts: validCarts.length
//       });

//       setUsers(validUsers);
//       setOrders(validOrders);
//       setCarts(validCarts);
      
//     } catch (error: any) {
//       console.error('❌ Dashboard fetch error:', error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to fetch dashboard data. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
//       case 'cancelled':
//         return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
//       default:
//         return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Stats Overview */}
//       <div className="grid gap-6 md:grid-cols-3">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
//             <CardTitle className="text-sm font-medium">Total Users</CardTitle>
//             <Users className="w-4 h-4 text-gray-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{users?.length || 0}</div>
//             <p className="text-xs text-gray-500">Registered users</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
//             <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
//             <Package className="w-4 h-4 text-gray-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {orders?.filter(order => order?.status?.toLowerCase() === 'pending').length || 0}
//             </div>
//             <p className="text-xs text-gray-500">Orders in progress</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
//             <CardTitle className="text-sm font-medium">Active Carts</CardTitle>
//             <ShoppingCart className="w-4 h-4 text-gray-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{carts?.length || 0}</div>
//             <p className="text-xs text-gray-500">Users with items in cart</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Orders */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Orders</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Customer</TableHead>
//                 <TableHead>Items</TableHead>
//                 <TableHead>Total Amount</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Date</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {orders && orders.length > 0 ? (
//                 orders.slice(0, 5).map((order) => {
//                   // ✅ Skip orders with null/invalid data
//                   if (!order || !order._id) return null;

//                   return (
//                     <TableRow key={order._id}>
//                       <TableCell>
//                         <div>
//                           {/* ✅ FIXED: Proper null checking */}
//                           <div className="font-medium">
//                             {order.userId?.firstName || 'Unknown Customer'}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {order.userId?.email || 'No email available'}
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>{order.items?.length || 0} items</TableCell>
//                       <TableCell>₹{order.totalAmount || 0}</TableCell>
//                       <TableCell>
//                         <Badge className={getStatusColor(order.status)}>
//                           {order.status || 'Unknown'}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown'}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 }).filter(Boolean) // Remove null entries
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center text-gray-500">
//                     No orders found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {/* Active Carts */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Active Shopping Carts</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Customer</TableHead>
//                 <TableHead>Items</TableHead>
//                 <TableHead>Total Value</TableHead>
//                 <TableHead>Last Updated</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {carts && carts.length > 0 ? (
//                 carts.slice(0, 5).map((cart) => {
//                   // ✅ Skip carts with null/invalid data
//                   if (!cart || !cart.userId?._id) return null;

//                   return (
//                     <TableRow key={cart.userId._id}>
//                       <TableCell>
//                         <div>
//                           {/* ✅ FIXED: Proper null checking */}
//                           <div className="font-medium">
//                             {cart.userId?.firstName || 'Unknown Customer'}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {cart.userId?.email || 'No email available'}
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>{cart.items?.length || 0} items</TableCell>
//                       <TableCell>
//                         ₹{cart.items?.reduce((total, item) => {
//                           // ✅ Safe calculation with null checks
//                           const price = item?.productId?.Product_price || 0;
//                           const quantity = item?.quantity || 0;
//                           return total + (price * quantity);
//                         }, 0) || 0}
//                       </TableCell>
//                       <TableCell>
//                         {cart.updatedAt ? new Date(cart.updatedAt).toLocaleDateString() : 'Unknown'}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 }).filter(Boolean) // Remove null entries
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={4} className="text-center text-gray-500">
//                     No active carts found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


// Dashboard.tsx - Enhanced with comprehensive null checking
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, Package, Users } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface User {
  _id: string;
  firstName: string;
  email: string;
  role: string;
  createdAt: string;
  phoneNo?: string;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    email: string;
    phoneNo?: string;
  } | null;
  Contact_number?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderNumber?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

interface CartItem {
  userId: {
    _id: string;
    firstName: string;
    email: string;
  } | null;
  items: Array<{
    productId: {
      Product_name: string;
      Product_price: number;
      Product_image?: string[];
    } | null;
    quantity: number;
  }>;
  updatedAt: string;
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [carts, setCarts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [product, setProducts] = useState<any[]>([]);
  const [er, setE] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchDashboardData();
    getProduct();
  }, []);

  const getProduct = async () => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      const res = await axios.get(`${API_URL}/admin/getproducts`, {
        withCredentials: true,
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
      });
      setProducts(res?.data?.product);
    } catch (e: any) {
      setE(e.message);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) throw new Error("No admin token found");

      const headers = {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      };

      const [usersRes, ordersRes, cartsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, { headers }),
        axios.get(`${API_URL}/admin/orders`, { headers }),
        axios.get(`${API_URL}/admin/carts`, { headers }),
      ]);

      const validUsers = Array.isArray(usersRes.data.users)
        ? usersRes.data.users.filter((user: any) => user && user._id && user.firstName)
        : [];

      const validOrders = Array.isArray(ordersRes.data.orders)
        ? ordersRes.data.orders.filter((order: any) => order && order._id)
        : [];

      const validCarts = Array.isArray(cartsRes.data.carts)
        ? cartsRes.data.carts.filter((cart: any) => cart && cart.userId)
        : [];

      setUsers(validUsers);
      setOrders(validOrders);
      setCarts(validCarts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
      </div>
    );
  }

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status?.toLowerCase() === statusFilter);

  return (
    <div className="space-y-6 p-6">
      {/* Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Users Card */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-gray-500">Registered users</p>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders?.filter((o) => o?.status?.toLowerCase() === "pending").length || 0}
            </div>
            <p className="text-xs text-gray-500">Orders in progress</p>
          </CardContent>
        </Card>

        {/* Carts Card */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Carts</CardTitle>
            <ShoppingCart className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carts?.length || 0}</div>
            <p className="text-xs text-gray-500">Users with items in cart</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>Recent Orders</CardTitle>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.slice(0, 5).map((order) => (
                    <TableRow key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {order.userId?.firstName || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.userId?.email || "No email"}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">
                        {order.items?.length || 0}
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">
                        ₹{order.totalAmount}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }}
                          className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800/60 transition-colors"
                        >
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Active Carts */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Active Shopping Carts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carts.length > 0 ? (
                  carts.slice(0, 5).map((cart) => (
                    <TableRow key={cart.userId?._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {cart.userId?.firstName || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {cart.userId?.email || "No email"}
                        </div>
                      </TableCell>
                      <TableCell>{cart.items?.length || 0}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">
                        ₹{cart.items?.reduce((total, i) =>
                          total + ((i?.productId?.Product_price || 0) * (i?.quantity || 0)), 0)}
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">
                        {cart.updatedAt ? new Date(cart.updatedAt).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No carts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Order Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-800 dark:text-gray-100 mb-2">
                  <strong>Order No:</strong> {selectedOrder.orderNumber}
                </p>
                <p className="text-gray-800 dark:text-gray-100 mb-2">
                  <strong>Status:</strong> {selectedOrder.status}
                </p>
                <p className="text-gray-800 dark:text-gray-100 mb-2">
                  <strong>Total:</strong> ₹{selectedOrder.totalAmount}
                </p>
                <p className="text-gray-800 dark:text-gray-100 mb-2">
                  <strong>Payment:</strong> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                </p>
                <p className="text-gray-800 dark:text-gray-100 mb-2">
                  <strong>Contact:</strong> {selectedOrder.Contact_number || selectedOrder.userId?.phoneNo || "—"}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping:</h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedOrder.shippingAddress?.street}</p>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedOrder.shippingAddress?.pincode}, {selectedOrder.shippingAddress?.country}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Items:</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => {
                  const p = product.find((pp: any) => pp._id === item.productId);
                  return (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg flex gap-3">
                      {p?.Product_image && (
                        <img 
                          src={p.Product_image[0]} 
                          className="w-16 h-16 object-cover rounded" 
                          alt={p.Product_name}
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {p?.Product_name || "Product"}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">Qty: {item.quantity}</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          ₹{p?.Product_price || item.price}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <OrderActions
              orderId={selectedOrder._id}
              onClose={() => { setShowOrderDetails(false); setSelectedOrder(null); fetchDashboardData(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// OrderActions Component
function OrderActions({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<"ship" | "cancel" | "deliver" | null>(null);

  const updateOrderStatus = async (status: "shipped" | "cancelled" | "delivered") => {
    try {
      setLoading(status === "shipped" ? "ship" : status === "cancelled" ? "cancel" : "deliver");
      const adminToken = localStorage.getItem("admin_token");
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

      const res = await axios.patch(
        `${API_URL}/orders/admin/status/${orderId}`,
        { status },
        { headers }
      );

      toast({
        title: "Success",
        description: `Order ${status} successfully! ${res?.data?.message || ""}`,
        variant: "default",
      });
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        Close
      </button>
      <button
        disabled={loading === "ship"}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 disabled:opacity-50 transition-colors"
        onClick={() => updateOrderStatus("shipped")}
      >
        {loading === "ship" && <Loader2 className="w-4 h-4 animate-spin" />}
        Ship Order
      </button>
      <button
        disabled={loading === "deliver"}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 transition-colors"
        onClick={() => updateOrderStatus("delivered")}
      >
        {loading === "deliver" && <Loader2 className="w-4 h-4 animate-spin" />}
        Mark Delivered
      </button>
      <button
        disabled={loading === "cancel"}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
        onClick={() => updateOrderStatus("cancelled")}
      >
        {loading === "cancel" && <Loader2 className="w-4 h-4 animate-spin" />}
        Cancel Order
      </button>
    </div>
  );
}


