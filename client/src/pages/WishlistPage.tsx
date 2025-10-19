import React, { useState, useCallback, useMemo, useRef } from "react";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import { Heart, Star, ShoppingCart, Sparkles, Plus, Minus, Trash2, Loader2, Crown, Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// ✅ Individual WishlistItem with local quantity state
const OptimizedWishlistItem = React.memo(({ 
  item, 
  onRemove, 
  onAddToCart, 
  onNavigate 
}: {
  item: any;
  onRemove: (productId: string) => void;
  onAddToCart: (product: any, quantity: number) => void;
  onNavigate: (productId: string) => void;
}) => {
  const { updateQuantity } = useWishlist();
  const product = item.product;
  
  // ✅ LOCAL state for immediate UI feedback
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // ✅ Debounced update to context/backend
  const debouncedUpdate = useCallback((newQuantity: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsUpdating(true);
      try {
        if (newQuantity < 1) {
          onRemove(product._id);
        } else {
          await updateQuantity(product._id, newQuantity);
        }
      } catch (error) {
        // Rollback on error
        setLocalQuantity(item.quantity);
        toast({
          title: "Error",
          description: "Failed to update quantity",
          variant: "destructive"
        });
      } finally {
        setIsUpdating(false);
      }
    }, 500); // 500ms debounce
  }, [product._id, updateQuantity, onRemove, item.quantity]);

  // ✅ Immediate local update with debounced sync
  const handleQuantityChange = useCallback((change: number) => {
    const newQuantity = Math.max(0, localQuantity + change);
    setLocalQuantity(newQuantity);
    debouncedUpdate(newQuantity);
  }, [localQuantity, debouncedUpdate]);

  // ✅ Memoized calculations
  const { originalPrice, discount } = useMemo(() => {
    const orig = Math.round(product.Product_price * 1.2);
    const disc = Math.round(((orig - product.Product_price) / orig) * 100);
    return { originalPrice: orig, discount: disc };
  }, [product.Product_price]);

  const handleProductClick = useCallback(() => {
    onNavigate(product._id);
  }, [product._id, onNavigate]);

  const handleAddToCartClick = useCallback(() => {
    onAddToCart(product, localQuantity);
  }, [product, localQuantity, onAddToCart]);

  const handleRemoveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(product._id);
  }, [product._id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-purple-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-2"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(248,240,252,.98) 60%, rgba(243,232,255,.98) 100%)",
      }}
    >
      {/* Product Image */}
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer bg-gradient-to-br from-purple-50 to-white"
        onClick={handleProductClick}
      >
        <img
          src={product.Product_image?.[0] || '/placeholder-image.jpg'}
          alt={product.Product_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Quantity Badge */}
        {localQuantity > 1 && (
          <div className="absolute top-4 left-4 bg-purple-600 text-white text-sm font-bold px-2 py-1 rounded-full shadow-lg">
            {localQuantity}
          </div>
        )}
        
        {/* Wishlist Button */}
        <Button
          variant="secondary"
          size="icon"
          type="button"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-purple-500 border-purple-500 text-white hover:bg-purple-600 hover:border-purple-600 shadow-lg z-10"
          onClick={handleRemoveClick}
          disabled={isUpdating}
        >
          <Heart size={18} fill="currentColor" />
        </Button>

        {/* Premium Badges */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
          {discount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full border border-purple-600">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
      </div>

      {/* Product Info */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-4">
          <h3 
            className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight cursor-pointer hover:text-purple-600 transition-colors mb-2"
            onClick={handleProductClick}
          >
            {product.Product_name}
          </h3>
        </div>

        <div className="mt-auto">
          {/* Price Section */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-gray-900">
              ₹{product.Product_price.toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* ✅ Optimized Quantity Controls */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Quantity:</span>
            <div className="flex items-center bg-purple-50 rounded-lg border border-purple-200">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="w-8 h-8 p-0 hover:bg-purple-100 rounded-l-lg disabled:opacity-50"
                onClick={() => handleQuantityChange(-1)}
                disabled={isUpdating}
              >
                <Minus size={14} />
              </Button>
              
              <span className="px-3 py-1 text-sm font-semibold min-w-[2rem] text-center relative">
                {localQuantity}
                {isUpdating && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="w-8 h-8 p-0 hover:bg-purple-100 rounded-r-lg disabled:opacity-50"
                onClick={() => handleQuantityChange(1)}
                disabled={isUpdating || localQuantity >= 99}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            type="button"
            className="w-full rounded-xl py-3 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCartClick}
            disabled={isUpdating || !product.Product_available}
          >
            {isUpdating ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <ShoppingCart size={16} className="mr-2 group-hover:scale-110 transition-transform" />
            )}
            {!product.Product_available 
              ? 'Out of Stock' 
              : `Add ${localQuantity > 1 ? `${localQuantity} ` : ''}to Cart`
            }
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

OptimizedWishlistItem.displayName = 'OptimizedWishlistItem';

// ✅ Main WishlistPage with minimal re-renders
const WishlistPage: React.FC = () => {
  const { 
    wishlist, 
    clearWishlist, 
    removeFromWishlist,
    getTotalItems,
    getTotalUniqueItems,
    loading
  } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // ✅ Stable handlers - only recreate when dependencies change
  const handleAddToCart = useCallback((product: any, quantity: number) => {
    try {
      const cartProduct = {
        id: Math.floor(Math.random() * 1000000),
        _id: product._id,
        name: product.Product_name,
        price: `₹${product.Product_price}`,
        originalPrice: `₹${Math.round(product.Product_price * 1.2)}`,
        image: product.Product_image?.[0] || '/placeholder-image.jpg',
        isNew: false,
        quantity: quantity,
        Product_name: product.Product_name,
        Product_price: product.Product_price,
        Product_image: product.Product_image,
      };

      addToCart(cartProduct);
      
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.Product_name} added to cart`,
        duration: 2000
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Could not add to cart",
        variant: "destructive"
      });
    }
  }, [addToCart]);

  const handleRemove = useCallback((productId: string) => {
    removeFromWishlist(productId);
    toast({ 
      title: "Removed from wishlist",
      description: "Item has been removed",
      duration: 2000 
    });
  }, [removeFromWishlist]);

  const handleNavigate = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const handleClearWishlist = useCallback(() => {
    clearWishlist();
    toast({ 
      title: "Wishlist cleared", 
      description: "All items have been removed from your wishlist",
      duration: 2000 
    });
  }, [clearWishlist]);

  // ✅ Memoize expensive calculations
  const totalItems = useMemo(() => getTotalItems(), [getTotalItems]);
  const totalUniqueItems = useMemo(() => getTotalUniqueItems(), [getTotalUniqueItems]);

  // Loading and empty states...
  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8f0fc 40%, #f3e8ff 100%)",
        }}
      >
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-purple-100">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-700">
            Loading your wishlist...
          </h2>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8f0fc 40%, #f3e8ff 100%)",
        }}
      >
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-purple-100">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-purple-600" fill="currentColor" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Your Wishlist is Empty
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Discover our premium collection and save your favorite pieces for later.
          </p>
          <Button 
            onClick={() => navigate("/")}
            size="lg" 
            type="button"
            className="rounded-xl px-12 py-3 bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Gem className="w-5 h-5 mr-2" />
            Explore Collections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section 
      className="py-20 min-h-screen"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8f0fc 40%, #f3e8ff 100%)",
      }}
    >
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header - only re-renders when totals actually change */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Crown className="w-4 h-4" />
              <span className="flex items-center gap-2">
                <span>RK Store Premium</span>
                <span className="text-purple-500">•</span>
                <span>{totalUniqueItems} {totalUniqueItems === 1 ? 'Item' : 'Items'}</span>
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Your Wishlist
            </h2>
            <p className="text-gray-600 mt-2">
              Curated collection of your favorite premium products
            </p>
          </div>
          
          {wishlist.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleClearWishlist}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </motion.div>

        {/* ✅ Optimized Products Grid - Each item manages its own state */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6"
        >
          {wishlist.map((item, index) => (
            <OptimizedWishlistItem
              key={item.product._id}
              item={item}
              onRemove={handleRemove}
              onAddToCart={handleAddToCart}
              onNavigate={handleNavigate}
            />
          ))}
        </motion.div>

        {/* Premium Summary */}
        {wishlist.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-purple-200">
              <Gem className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">
                Curating {totalItems} premium product{totalItems !== 1 ? 's' : ''} across {totalUniqueItems} unique item{totalUniqueItems !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default React.memo(WishlistPage);