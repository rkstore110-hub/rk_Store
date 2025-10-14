
import React, { createContext, useContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<{ success: boolean; user?: any; error?: string }>;
  loginWithData: (userObj: any, token?: string) => void; // For direct login (signup)
  logout: () => void;
  updateUser: (userObj: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  loginWithData: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Try to load from localStorage - check both storage keys
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('user_token') || localStorage.getItem('token');
        const adminUser = localStorage.getItem('admin_user');
        const adminToken = localStorage.getItem('admin_token');
        
        let userData = null;
        let userToken = null;
        
        if (storedUser) {
          userData = JSON.parse(storedUser);
          userToken = storedToken;
        } else if (adminUser) {
          userData = JSON.parse(adminUser);
          userToken = adminToken || storedToken;
        }
        
        if (userData) {
          // Ensure user has token property
          if (userToken && !userData.token) {
            userData.token = userToken;
          }
          
          setUser(userData);
    
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('user_token');
        localStorage.removeItem('token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
      }
    };

    initializeAuth();

    // Listen for storage events (multi-tab sync)
    const onStorage = (e: StorageEvent) => {
  // ✅ Listen for ALL relevant storage keys
  if (['user', 'admin_user', 'user_token', 'admin_token', 'token'].includes(e.key)) {
    const stored = localStorage.getItem("user") || localStorage.getItem("admin_user");
    
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        // ✅ Get appropriate token based on what's available
        const token = localStorage.getItem('admin_token') || 
                     localStorage.getItem('user_token') || 
                     localStorage.getItem('token');
        
        if (token && !userData.token) {
          userData.token = token;
        }
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }
};
    
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Regular email/password login
  const login = async (credentials: any) => {
    try {
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }

      const data = await response.json();

      // ✅ FIXED: Your backend returns { reply: {...}, accessToken: "...", message: "..." }
      const userWithToken = {
        ...data.reply, // ✅ Use data.reply instead of data.user
        token: data.accessToken
      };

      setUser(userWithToken);
      
      // ✅ FIXED: Store with consistent key names
      if (userWithToken.role === 'admin') {
        localStorage.setItem('admin_user', JSON.stringify(userWithToken));
        localStorage.setItem('admin_token', data.accessToken);
      } else {
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('user_token', data.accessToken); // ✅ Use user_token for consistency
      }
      
     
      return { success: true, user: userWithToken };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // For direct user data login (used by signup flow)
  const loginWithData = (userObj: any, token?: string) => {

    
    const userWithToken = {
      ...userObj,
      token: token || userObj.token
    };

    setUser(userWithToken);
    
    // ✅ FIXED: Store with consistent key names based on role
    if (userWithToken.role === 'admin') {
      localStorage.setItem('admin_user', JSON.stringify(userWithToken));
      if (token) {
        localStorage.setItem('admin_token', token);
      }
    } else {
      localStorage.setItem('user', JSON.stringify(userWithToken));
      if (token) {
        localStorage.setItem('user_token', token); // ✅ Consistent with signup
      }
    }
  };

  const updateUser = (userObj: any) => {
    // Preserve existing token if not provided
    const updatedUser = {
      ...userObj,
      token: userObj.token || user?.token
    };
    
    setUser(updatedUser);
    
    // Store in appropriate location based on role
    if (updatedUser.role === 'admin') {
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
    } else {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = async () => {
  
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok && response.status !== 401) {
      // Only log error if it's not 401 which we treat as acceptable
      console.error('Logout API returned error:', response.status);
    }
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue logout anyway
  }

  // Clear all local sensitive info / state
  setUser(null);
  localStorage.removeItem("user");
  localStorage.removeItem("user_token");
  localStorage.removeItem("token");
  localStorage.removeItem("admin_user");
  localStorage.removeItem("admin_token");
};


  // isAuthenticated is true if user exists and has a token
  const isAuthenticated = Boolean(user && user.token);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      loginWithData, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
