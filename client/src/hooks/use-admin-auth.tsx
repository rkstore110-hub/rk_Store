import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAdminAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("admin_user") || "null");
    const token = localStorage.getItem("admin_token");
    if (!user || user.role !== "admin" || !token) {
      navigate("/admin/login");
    }
  }, [navigate]);
} 