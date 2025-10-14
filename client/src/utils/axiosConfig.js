// import axios from 'axios';
// import { TokenManager } from './tokenManager';

// const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

// const axiosInstance = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// // ✅ Smart request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Determine context based on URL
//     const isAdminRequest = config.url?.includes('/admin') || 
//                           config.url?.includes('/orders/admin');
    
//     const context = isAdminRequest ? 'admin' : 'user';
//     const token = TokenManager.getToken(context);
    
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log(`🔑 Added ${context} token to request:`, config.url);
//     } else {
//       console.warn(`⚠️ No ${context} token found for request:`, config.url);
//     }
    
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ✅ Smart response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       const isAdminRequest = error.config?.url?.includes('/admin') ||
//                            window.location.pathname.includes('/admin');
      
//       const context = isAdminRequest ? 'admin' : 'user';
      
//       console.log(`🔑 401 error for ${context} - clearing tokens`);
//       TokenManager.clearTokens(context);
      
//       // Redirect to appropriate login
//       const redirectPath = isAdminRequest ? '/admin/login' : '/login';
//       window.location.href = redirectPath;
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;



import axios from 'axios';
import { TokenManager } from './tokenManager';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_URL, 
  withCredentials: true,
});


// ✅ Enhanced context detection with debugging
function getCurrentUserContext() {
  // Check all possible admin indicators
  const adminUser = localStorage.getItem('admin_user');
  const userRole = localStorage.getItem('user_role');
  const currentPath = window.location.pathname;
  const hasAdminToken = TokenManager.hasValidToken('admin');
  const hasUserToken = TokenManager.hasValidToken('user');
  
  // Also check these common admin indicators
  const adminFromStorage = localStorage.getItem('user_role') === 'admin';
  const adminFromUserData = JSON.parse(localStorage.getItem('user') || '{}')?.role === 'admin';
  
  const isAdminContext = !!(
    adminUser || 
    userRole === 'admin' || 
    adminFromStorage ||
    adminFromUserData ||
    currentPath.includes('/admin') ||
    hasAdminToken
  );
  
  // ✅ Detailed debug logging
  console.log('🔍 FULL Context Debug:', {
    adminUser,
    userRole,
    adminFromStorage,
    adminFromUserData,
    currentPath,
    hasAdminToken,
    hasUserToken,
    isAdminContext,
    localStorage: {
      admin_user: localStorage.getItem('admin_user'),
      user_role: localStorage.getItem('user_role'),
      user: localStorage.getItem('user'),
      admin_token: !!localStorage.getItem('admin_token'),
      token: !!localStorage.getItem('token')
    }
  });
  
  return {
    isAdmin: isAdminContext,
    hasAdminToken,
    hasUserToken
  };
}


// ✅ Enhanced smart request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Enhanced context detection logic
    const isAdminRequest = 
      // Traditional admin URLs
      config.url?.includes('/admin') || 
      config.url?.includes('/orders/admin') ||
      // Admin-specific operations
      config.url?.includes('/hamper') ||
      config.url?.includes('/products') ||
      config.url?.includes('/users') ||
      // Check if current page is admin
      window.location.pathname.includes('/admin') ||
      // Check if user has admin role
      checkIfCurrentUserIsAdmin();
    
    const context = isAdminRequest ? 'admin' : 'user';
    const token = TokenManager.getToken(context);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Added ${context} token to request:`, config.url);
    } else {
      // ✅ Fallback: try both tokens if primary fails
      const fallbackContext = context === 'admin' ? 'user' : 'admin';
      const fallbackToken = TokenManager.getToken(fallbackContext);
      
      if (fallbackToken) {
        config.headers.Authorization = `Bearer ${fallbackToken}`;
        console.log(`🔄 Using fallback ${fallbackContext} token for:`, config.url);
      } else {
        console.warn(`⚠️ No tokens found for request:`, config.url);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Helper function to check if current user is admin
function checkIfCurrentUserIsAdmin() {
  try {
    // Check localStorage for admin indicators
    const adminUser = localStorage.getItem('admin_user');
    const userRole = localStorage.getItem('user_role');
    
    // Check if we have admin token
    const hasAdminToken = TokenManager.hasValidToken('admin');
    
    return !!(adminUser || userRole === 'admin' || hasAdminToken);
  } catch (error) {
    console.warn('Error checking admin status:', error);
    return false;
  }
}

// ✅ Enhanced response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔑 401 Unauthorized error:', error.config?.url);
      
      // Determine context for redirect
      const isAdminContext = 
        error.config?.url?.includes('/admin') ||
        error.config?.url?.includes('/hamper') ||
        window.location.pathname.includes('/admin') ||
        checkIfCurrentUserIsAdmin();
      
      const context = isAdminContext ? 'admin' : 'user';
      
      console.log(`🔑 401 error for ${context} context - clearing tokens`);
      
      // Clear appropriate tokens
      TokenManager.clearTokens(context);
      
      // Redirect to appropriate login
      const redirectPath = isAdminContext ? '/admin/login' : '/login';
      
      // Add delay to prevent multiple redirects
      setTimeout(() => {
        if (window.location.pathname !== redirectPath) {
          window.location.href = redirectPath;
        }
      }, 100);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
