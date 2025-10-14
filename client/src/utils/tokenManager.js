// ✅ Smart token management for user vs admin contexts
export const TokenManager = {
  // Detect current context based on URL or other indicators
  getCurrentContext: () => {
    const path = window.location.pathname;
    const isAdminPath = path.includes("/admin") || path.startsWith("/admin");
    return isAdminPath ? "admin" : "user";
  },

  // Get appropriate token based on context
  getToken: (forceContext = null) => {
    const context = forceContext || TokenManager.getCurrentContext();

    if (context === "admin") {
      return (
        localStorage.getItem("admin_token") ||
        localStorage.getItem("adminToken")
      );
    } else {
      // ✅ Check user_token first (what AuthContext actually stores)
      return (
        localStorage.getItem("user_token") || localStorage.getItem("token")
      );
    }
  },

  // Set token based on context
  setToken: (token, context = null) => {
    const targetContext = context || TokenManager.getCurrentContext();

    if (targetContext === "admin") {
      localStorage.setItem("admin_token", token);
      console.log("✅ Admin token stored");
    } else {
      localStorage.setItem("token", token);
      console.log("✅ User token stored");
    }
  },

  // Clear tokens (optionally specific context)
  clearTokens: (context = null) => {
    if (!context || context === "user") {
      localStorage.removeItem("token");
      localStorage.removeItem("user_token");
      localStorage.removeItem("user");
    }

    if (!context || context === "admin") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin_user");
    }

    console.log(`🗑️ Cleared ${context || "all"} tokens`);
  },

  // Check if valid token exists for context
  hasValidToken: (context = null) => {
    const token = TokenManager.getToken(context);
    return !!token;
  },
};
