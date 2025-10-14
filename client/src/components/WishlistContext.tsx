import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

// Product interface matching your cart structure
interface Product {
  _id: string;
  Product_name: string;
  Product_price: number;
  Product_image: string[];
  Product_rating?: number;
  isNew?: boolean;
  category?: string;
  description?: string;
  Product_available?: boolean;
  Product_category?: {
    category: string;
  };
}

// Backend wishlist item structure
interface BackendWishlistItem {
  _id: string;
  productId: {
    _id: string;
    Product_name: string;
    Product_price: number;
    Product_image: string[];
    Product_category: {
      category: string;
    };
    Product_available: boolean;
  };
  quantity: number;
  dateAdded: string;
}

// Frontend wishlist item
interface WishlistItem {
  product: Product;
  quantity: number;
  dateAdded: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  toggleWishlist: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromWishlist: (productId: string) => void;
  getQuantity: (productId: string) => number;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
  getTotalUniqueItems: () => number;
  loading: boolean;
  syncWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Helper functions (similar to cart)
const getStoredWishlist = (): WishlistItem[] => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wishlist");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  } catch (error) {
    console.error("Error loading wishlist from localStorage:", error);
    return [];
  }
};

const storeWishlist = (wishlist: WishlistItem[]) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  } catch (error) {
    console.error("Error saving wishlist to localStorage:", error);
  }
};

// Convert backend wishlist item to frontend format
const convertBackendItemToWishlistItem = (item: BackendWishlistItem): WishlistItem => {
  return {
    product: {
      _id: item.productId._id,
      Product_name: item.productId.Product_name,
      Product_price: item.productId.Product_price,
      Product_image: item.productId.Product_image,
      Product_category: item.productId.Product_category,
      Product_available: item.productId.Product_available,
      category: item.productId.Product_category?.category,
    },
    quantity: item.quantity,
    dateAdded: item.dateAdded,
  };
};

// Convert frontend product to backend format
const convertProductToBackendFormat = (item: WishlistItem) => {
  return {
    productId: item.product._id,
    quantity: item.quantity,
    dateAdded: item.dateAdded,
  };
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [previousAuthState, setPreviousAuthState] = useState<boolean | null>(null);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Load wishlist on component mount and handle authentication changes
  useEffect(() => {
    loadWishlist();
  }, [user, isAuthenticated]);

  // Handle logout and login scenarios properly
  useEffect(() => {
    // Skip on first render
    if (previousAuthState === null) {
      setPreviousAuthState(isAuthenticated);
      return;
    }

    // User logged out (was authenticated, now not)
    if (previousAuthState && !isAuthenticated) {
      setHasLoggedOut(true);

      // Save current wishlist to localStorage for guest browsing
      if (wishlist.length > 0) {
        storeWishlist(wishlist);
      }
    }
    // User logged in (was not authenticated, now is)
    else if (!previousAuthState && isAuthenticated) {
      setHasLoggedOut(false);
      syncWishlistOnLogin();
    }

    setPreviousAuthState(isAuthenticated);
  }, [isAuthenticated, previousAuthState]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user && user.token && !hasLoggedOut) {
        // Load from backend only if not in post-logout state
        await loadWishlistFromBackend();
      } else {
        // Load from localStorage for guests or after logout
        loadWishlistFromLocalStorage();
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
      loadWishlistFromLocalStorage();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const loadWishlistFromLocalStorage = () => {
    try {
      const storedWishlist = getStoredWishlist();
      const validWishlist = storedWishlist.filter(
        (item) => item && item.product && item.product._id && item.product.Product_name
      );

      setWishlist(validWishlist);
    } catch (error) {
      console.error("Error loading wishlist from localStorage:", error);
      setWishlist([]);
    }
  };

  const loadWishlistFromBackend = async () => {
    if (!user || !user.token) return;


    try {
      const response = await fetch(`${API_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.wishlist && Array.isArray(data.wishlist)) {
        const frontendWishlist = data.wishlist.map(convertBackendItemToWishlistItem);
        setWishlist(frontendWishlist);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error("Error loading wishlist from backend:", error);
      throw error;
    }
  };

  // Fixed wishlist sync on login - prevents duplication
  const syncWishlistOnLogin = async () => {
    if (!isAuthenticated || !user || !user.token) return;

    const localWishlist = getStoredWishlist();

    setLoading(true);
    try {
      if (localWishlist.length === 0) {
        // No local wishlist, just load from backend
        await loadWishlistFromBackend();
        return;
      }


      // Replace backend wishlist with local wishlist instead of merging
      const backendItems = localWishlist.map(convertProductToBackendFormat);

      const syncResponse = await fetch(`${API_URL}/wishlist/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: backendItems }),
      });

      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        if (syncData.wishlist) {
          const finalWishlist = syncData.wishlist.map(convertBackendItemToWishlistItem);
          setWishlist(finalWishlist);

          // Clear localStorage after successful sync
          localStorage.removeItem("wishlist");

        }
      } else {
        // Fallback: use local wishlist
        setWishlist(localWishlist);
      }
    } catch (error) {
      console.error("Error syncing wishlist on login:", error);
      // Fallback to local wishlist
      setWishlist(localWishlist);
    } finally {
      setLoading(false);
    }
  };

  // Save to localStorage only when not authenticated or after logout
  useEffect(() => {
    if (initialized && (!isAuthenticated || hasLoggedOut)) {
      storeWishlist(wishlist);
    }
  }, [wishlist, initialized, isAuthenticated, hasLoggedOut]);

  const toggleWishlist = async (product: Product, quantity: number = 1) => {
    if (!product || !product._id) {
      toast({
        title: "Error",
        description: "Invalid product data",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const isCurrentlyInWishlist = wishlist.some(item => item.product._id === product._id);

      if (isAuthenticated && user && user.token && !hasLoggedOut) {
        if (isCurrentlyInWishlist) {
          // Remove from backend wishlist
          const response = await fetch(`${API_URL}/wishlist/remove/${product._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.wishlist) {
            const frontendWishlist = data.wishlist.map(convertBackendItemToWishlistItem);
            setWishlist(frontendWishlist);
          }
        } else {
          // Add to backend wishlist
          const response = await fetch(`${API_URL}/wishlist/add`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: product._id,
              quantity: Math.max(1, quantity),
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.wishlist) {
            const frontendWishlist = data.wishlist.map(convertBackendItemToWishlistItem);
            setWishlist(frontendWishlist);
          }
        }
      } else {
        // Handle localStorage for guests
        setWishlist((prevWishlist) => {
          const existingIndex = prevWishlist.findIndex(item => item.product._id === product._id);
          
          if (existingIndex !== -1) {
            // Remove from wishlist
            return prevWishlist.filter(item => item.product._id !== product._id);
          } else {
            // Add to wishlist
            const newItem: WishlistItem = {
              product: product,
              quantity: Math.max(1, quantity),
              dateAdded: new Date().toISOString()
            };
            return [...prevWishlist, newItem];
          }
        });
      }

      toast({
        title: isCurrentlyInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: `${product.Product_name} ${isCurrentlyInWishlist ? 'removed from' : 'added to'} wishlist`,
      });
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const qty = Math.max(1, Math.min(99, quantity)); // Limit between 1-99

    setLoading(true);
    try {
      if (isAuthenticated && user && user.token && !hasLoggedOut) {
        // Update in backend
        const response = await fetch(`${API_URL}/wishlist/update/${productId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: qty }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.wishlist) {
          const frontendWishlist = data.wishlist.map(convertBackendItemToWishlistItem);
          setWishlist(frontendWishlist);
        }
      } else {
        // Update in localStorage
        setWishlist((prevWishlist) =>
          prevWishlist.map((item) =>
            item.product._id === productId
              ? { ...item, quantity: qty }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setLoading(true);
    try {
      if (isAuthenticated && user && user.token && !hasLoggedOut) {
        // Remove from backend
        const response = await fetch(`${API_URL}/wishlist/remove/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.wishlist) {
          const frontendWishlist = data.wishlist.map(convertBackendItemToWishlistItem);
          setWishlist(frontendWishlist);
        }
      } else {
        // Remove from localStorage
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.product._id !== productId)
        );
      }

      toast({
        title: "Removed from wishlist",
        description: "Item removed from your wishlist",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user && user.token && !hasLoggedOut) {
        // Clear backend wishlist
        const response = await fetch(`${API_URL}/wishlist/clear`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Clear local wishlist
      setWishlist([]);
      localStorage.removeItem("wishlist");

      toast({
        title: "Wishlist cleared",
        description: "All items removed from wishlist",
      });
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to clear wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getQuantity = (productId: string): number => {
    const item = wishlist.find((item) => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item.product._id === productId);
  };

  const getTotalItems = (): number => {
    return wishlist.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalUniqueItems = (): number => {
    return wishlist.length;
  };

  const syncWishlist = async () => {
    return syncWishlistOnLogin();
  };

  const contextValue: WishlistContextType = {
    wishlist,
    toggleWishlist,
    updateQuantity,
    removeFromWishlist,
    getQuantity,
    isInWishlist,
    clearWishlist,
    getTotalItems,
    getTotalUniqueItems,
    loading,
    syncWishlist,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
