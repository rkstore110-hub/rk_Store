import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

const orderStatusColors: { [key: string]: string } = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const paymentStatusColors: { [key: string]: string } = {
  pending: "bg-yellow-500",
  paid: "bg-green-500",
  failed: "bg-red-500",
};

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      const res = await axios.get(`${API_URL}/orders/admin/all`, {
        withCredentials: true,
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      });
      setOrders(res.data.orders || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      await axios.patch(
        `${API_URL}/orders/admin/${orderId}/status`,
        { orderStatus: status },
        {
          withCredentials: true,
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
        }
      );
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: status } : order
      ));
      
      toast({
        title: "Success",
        description: "Order status updated successfully"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
      
      {loading ? (
        <div className="text-center">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user?.firstName}<br />
                    <span className="text-xs">{order.user?.email}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.items.map((item: any) => (
                      <div key={item._id} className="mb-1">
                        {item.name} x {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{order.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${paymentStatusColors[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Select
                      value={order.orderStatus}
                      onValueChange={(value) => updateOrderStatus(order._id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          <Badge className={`${orderStatusColors[order.orderStatus]}`}>
                            {order.orderStatus}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 