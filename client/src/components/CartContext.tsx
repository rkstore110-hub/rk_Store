
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  isNew: boolean;
  quantity?: number;
  _id?: string;
  Product_name?: string;
  Product_price?: number;
  Product_image?: string[];
}

interface BackendCartItem {
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
}

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeCart: (productId: number | string) => void;
  clearCart: () => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  loading: boolean;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper functions
const getStoredCart = (): Product[] => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return [];
  }
};

const storeCart = (cart: Product[]) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

const extractPrice = (price: any): number => {
  if (!price) return 0;
  const priceString = typeof price === "string" ? price : String(price);
  const numeric = parseFloat(priceString.replace(/[^0-9.-]+/g, ""));
  return isNaN(numeric) ? 0 : numeric;
};

// ✅ FIXED: Simplified conversion for normal products only
const convertBackendItemToProduct = (item: BackendCartItem): Product | null => {
  // Add defensive checks for null/undefined productId
  if (!item.productId || !item.productId._id) {
    console.warn('Invalid cart item - missing productId:', item);
    return null; // This will be filtered out
  }

  return {
    id: parseInt(item.productId._id.slice(-6), 16) % 1000000,
    _id: item.productId._id,
    name: item.productId.Product_name || 'Unknown Product',
    Product_name: item.productId.Product_name || 'Unknown Product',
    price: item.productId.Product_price?.toString() || "0",
    Product_price: item.productId.Product_price || 0,
    originalPrice: item.productId.Product_price?.toString() || "0",
    image: item.productId.Product_image?.[0] || "",
    Product_image: item.productId.Product_image || [],
    isNew: false,
    quantity: item.quantity || 1,
  };
};

const convertProductToBackendFormat = (product: Product) => {
  return {
    id: product._id || product.id.toString(),
    quantity: product.quantity || 1,
    productId: product._id,
  };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [previousAuthState, setPreviousAuthState] = useState<boolean | null>(
    null
  );
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Load cart on component mount and handle authentication changes
  useEffect(() => {
    loadCart();
  }, [user, isAuthenticated]);

  // ✅ Handle logout and login scenarios properly
  useEffect(() => {
    // Skip on first render
    if (previousAuthState === null) {
      setPreviousAuthState(isAuthenticated);
      return;
    }

    // User logged out (was authenticated, now not)
    if (previousAuthState && !isAuthenticated) {
      setHasLoggedOut(true);

      // Save current cart to localStorage for guest browsing
      if (cart.length > 0) {
        storeCart(cart);
      }
    }
    // User logged in (was not authenticated, now is)
    else if (!previousAuthState && isAuthenticated) {
      setHasLoggedOut(false);
      syncCartOnLogin();
    }

    setPreviousAuthState(isAuthenticated);
  }, [isAuthenticated, previousAuthState]);

  const loadCart = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user && user.token && !hasLoggedOut) {
        // Load from backend only if not in post-logout state
        await loadCartFromBackend();
      } else {
        // Load from localStorage for guests or after logout
        loadCartFromLocalStorage();
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      loadCartFromLocalStorage();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const loadCartFromLocalStorage = () => {
    try {
      const storedCart = getStoredCart();
      const validCart = storedCart.filter(
        (item) => item && item.price && (item.id || item._id) && item.name
      );

      setCart(validCart);
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setCart([]);
    }
  };

  // ✅ FIXED: Complete loadCartFromBackend function
  const loadCartFromBackend = async () => {
    if (!user || !user.token) return;


    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.cart && Array.isArray(data.cart)) {
        // ✅ DEFENSIVE: Convert items and filter out null results
        const frontendCart = data.cart
          .map(item => {
            try {
              return convertBackendItemToProduct(item);
            } catch (error) {
              console.warn('Failed to convert cart item:', item, error);
              return null;
            }
          })
          .filter(Boolean); // Remove null items

        setCart(frontendCart);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Error loading cart from backend:", error);
      throw error;
    }
  };

  // ✅ Fixed cart sync on login - prevents duplication
  const syncCartOnLogin = async () => {
    if (!isAuthenticated || !user || !user.token) return;

    const localCart = getStoredCart();

    setLoading(true);
    try {
      if (localCart.length === 0) {
        // No local cart, just load from backend
        await loadCartFromBackend();
        return;
      }


      // ✅ FIXED: Replace backend cart with local cart instead of merging
      // This prevents duplication issues
      const backendItems = localCart.map(convertProductToBackendFormat);

      const syncResponse = await fetch(`${API_URL}/cart/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: backendItems }),
      });

      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        if (syncData.cart) {
          const finalCart = syncData.cart
            .map(item => {
              try {
                return convertBackendItemToProduct(item);
              } catch (error) {
                console.warn('Failed to convert synced cart item:', item, error);
                return null;
              }
            })
            .filter(Boolean);
          
          setCart(finalCart);

          // Clear localStorage after successful sync
          localStorage.removeItem("cart");

        }
      } else {
        // Fallback: use local cart
        setCart(localCart);
      }
    } catch (error) {
      console.error("Error syncing cart on login:", error);
      // Fallback to local cart
      setCart(localCart);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save to localStorage only when not authenticated or after logout
  useEffect(() => {
    if (initialized && (!isAuthenticated || hasLoggedOut)) {
      storeCart(cart);
    }
  }, [cart, initialized, isAuthenticated, hasLoggedOut]);

  // ✅ SIMPLIFIED: Add to cart (normal products only)
  const addToCart = async (product: Product) => {
    if (!product || !product.price || !(product.id || product._id)) {
      toast({
        title: "Error",
        description: "Invalid product data",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isAuthenticated && user && user.token && !hasLoggedOut) {
        const backendProductId = product._id || product.id;


        // ✅ SIMPLIFIED: Only send productId and quantity for normal products
        const response = await fetch(`${API_URL}/cart/add`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: backendProductId,
            quantity: product.quantity || 1,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        if (data.cart) {
          const frontendCart = data.cart
            .map(item => {
              try {
                return convertBackendItemToProduct(item);
              } catch (error) {
                console.warn('Failed to convert cart item after add:', item, error);
                return null;
              }
            })
            .filter(Boolean);
          
          setCart(frontendCart);
        }
      } else {
        // Add to localStorage for guests
        setCart((prevCart) => {
          const existingIndex = prevCart.findIndex(
            (p) => p.id === product.id || p._id === product._id
          );

          if (existingIndex !== -1) {
            return prevCart.map((item, index) =>
              index === existingIndex
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            );
          } else {
            return [...prevCart, { ...product, quantity: 1 }];
          }
        });
      }

      toast({
        title: "Added to cart",
        description: `${product.name || product.Product_name} added to cart`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: `Failed to add item to cart: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCart = async (productId: number | string) => {
    setLoading(true);
    try {
      if (isAuthenticated && user && user.token && !hasLoggedOut) {
        // ✅ FIXED: Use MongoDB _id for backend requests
        const product = cart.find(
          (p) => p.id == productId || p._id == productId
        );
        const backendProductId = product?._id || productId;


        const response = await fetch(
          `${API_URL}/cart/remove/${backendProductId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.cart) {
          const frontendCart = data.cart
            .map(item => {
              try {
                return convertBackendItemToProduct(item);
              } catch (error) {
                console.warn('Failed to convert cart item after remove:', item, error);
                return null;
              }
            })
            .filter(Boolean);
          
          setCart(frontendCart);
        }
      } else {
        // Remove from localStorage
        setCart((prevCart) =>
          prevCart.filter((p) => p.id !== productId && p._id !== productId)
        );
      }

      toast({
        title: "Item removed",
        description: "Item removed from cart",
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user && user.token && !hasLoggedOut) {
        // Clear backend cart
        const response = await fetch(`${API_URL}/cart/clear`, {
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

      // Clear local cart
      setCart([]);
      localStorage.removeItem("cart");

      toast({
        title: "Cart cleared",
        description: "All items removed from cart",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (
    productId: number | string,
    quantity: number
  ) => {
    const qty = Math.max(1, Math.floor(quantity));

    setLoading(true);
    try {
      if (isAuthenticated && user && user.token && !hasLoggedOut) {
        // ✅ FIXED: Find the product and use its MongoDB _id
        const product = cart.find(
          (p) => p.id == productId || p._id == productId
        );

        if (!product) {
          console.error("❌ Product not found in cart:", productId);
          throw new Error("Product not found in cart");
        }

        // Use the MongoDB ObjectId (_id) for backend requests
        const backendProductId = product._id;

     

        // Update in backend
        const response = await fetch(
          `${API_URL}/cart/update/${backendProductId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ quantity: qty }),
          }
        );


        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.cart) {
          const frontendCart = data.cart
            .map(item => {
              try {
                return convertBackendItemToProduct(item);
              } catch (error) {
                console.warn('Failed to convert cart item after update:', item, error);
                return null;
              }
            })
            .filter(Boolean);
          
          setCart(frontendCart);
        }
      } else {
        // Update in localStorage
        setCart((prevCart) =>
          prevCart.map((p) =>
            p.id === productId || p._id === productId
              ? { ...p, quantity: qty }
              : p
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

  const syncCart = async () => {
    return syncCartOnLogin();
  };

  const getCartCount = () =>
    cart.reduce((acc, p) => acc + (p.quantity || 1), 0);
  const getCartTotal = () =>
    cart.reduce((acc, p) => acc + extractPrice(p.price) * (p.quantity || 1), 0);

  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeCart,
    clearCart,
    updateQuantity,
    getCartCount,
    getCartTotal,
    loading,
    syncCart,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};

