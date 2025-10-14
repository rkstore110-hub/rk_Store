import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthContext";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const res = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users || []);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handlePromote = async (userId: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.post(`${API_URL}/auth/admin`, { userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.map(u => u._id === userId ? { ...u, role: "admin" } : u));
    } catch (err) {
      // handle error
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-500">No users found.</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100 dark:bg-black">

              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(userItem => (
              <tr key={userItem._id}>
                <td className="p-2 border">{userItem.firstName}</td>
                <td className="p-2 border">{userItem.email}</td>
                <td className="p-2 border">{userItem.role}</td>
                <td className="p-2 border">
                  {user?.role === "superadmin" && userItem.role !== "admin" && (
                    <Button size="sm" onClick={() => handlePromote(userItem._id)}>
                      Promote to Admin
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 