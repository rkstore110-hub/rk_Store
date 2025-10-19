import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosConfig";
import { Sparkles, Search, SortAsc, Heart, ShoppingCart, Eye, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  Product_name: string;
  Product_price: number;
  Product_discription: string;
  Product_category: string;
  Product_image: string[];
  isNew?: boolean;
  Product_available?: boolean;
  Product_rating?: number;
}

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const res = await axiosInstance.get(
          `/api/getproductsbycategory?category=${categoryName}`
        );
        
        const productsData = res.data.product || res.data.products || [];
        setProducts(productsData);
        
        if (productsData.length === 0) {
          console.warn('No products found for category:', categoryName);
        }
        
      } catch (error: any) {
        console.error("Failed to load products for category:", categoryName, error);
        
        const errorMessage = error.response?.status === 404 
          ? `No products found in ${categoryName} category`
          : `Failed to load ${categoryName} products. Please try again.`;
          
        toast({
          title: "Error loading products",
          description: errorMessage,
          duration: 3000,
        });
        
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName, toast]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.Product_price - b.Product_price;
      case 'price-high':
        return b.Product_price - a.Product_price;
      case 'name':
      default:
        return a.Product_name.localeCompare(b.Product_name);
    }
  });

  const calculateDiscount = (price: number, originalPrice: number): number => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: Product): void => {
    e.stopPropagation();
    if (user) {
      const wishlistProduct = {
        _id: product._id,
        Product_name: product.Product_name,
        Product_price: product.Product_price,
        Product_image: product.Product_image,
        isNew: product.isNew,
        category: product.Product_category,
        description: product.Product_discription
      };
      
      const wasInWishlist = isInWishlist(product._id);
      toggleWishlist(wishlistProduct);
      
      toast({ 
        title: wasInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: wasInWishlist 
          ? `${product.Product_name} removed from your wishlist` 
          : `${product.Product_name} added to your wishlist`,
        duration: 2000 
      });
    } else {
      navigate("/login");
    }
  };

  const handleAddToCart = (product: Product): void => {
    if (user) {
      try {
        const cartProduct = {
          id: parseInt(product._id.slice(-8), 16),
          _id: product._id,
          name: product.Product_name,
          price: `₹${product.Product_price}`,
          originalPrice: `₹${Math.round(product.Product_price * 1.2)}`,
          image: product.Product_image[0] || '',
          rating: product.Product_rating || 4.5,
          isNew: product.isNew || false,
          quantity: 1,
          Product_name: product.Product_name,
          Product_price: product.Product_price,
          Product_image: product.Product_image,
          Product_available: product.Product_available
        };
        
        addToCart(cartProduct);
        toast({ 
          title: "Added to cart", 
          description: `${product.Product_name} has been added to your cart`,
          duration: 3000 
        });
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast({
          title: "Error",
          description: "Failed to add to cart. Please try again.",
          duration: 2000,
        });
      }
    } else {
      navigate("/login");
    }
  };

  const handleProductClick = (productId: string): void => {
    navigate(`/product/${productId}`);
  };

  const SkeletonCard = () => (
    <div 
      className="bg-white rounded-xl border border-purple-200 shadow-lg overflow-hidden animate-pulse"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(250,245,255,.98) 60%, rgba(245,240,255,.98) 100%)",
      }}
    >
      <div className="aspect-square bg-gradient-to-br from-purple-100 to-white"></div>
      <div className="p-4">
        <div className="h-4 bg-purple-200 rounded mb-2"></div>
        <div className="h-6 bg-gradient-to-r from-purple-200 to-purple-100 rounded mb-3"></div>
        <div className="h-10 bg-purple-200 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 40%, #f3e8ff 100%)",
      }}
    >
      <AnnouncementBar />
      <Header />
      
      {/* Premium Hero Section */}
      <div className="pt-24 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-400/5 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 lg:px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 border border-purple-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Crown className="w-4 h-4" />
              RK Store Premium
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-800 via-purple-700 to-purple-900 bg-clip-text text-transparent mb-6 capitalize leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {categoryName} Collection
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-purple-600 mb-8 leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Discover our curated selection of premium {categoryName} pieces, meticulously crafted for exceptional quality and timeless elegance
            </motion.p>
            
            {!loading && products.length > 0 && (
              <motion.div 
                className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full px-6 py-3 text-sm shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <span className="text-purple-800 font-bold">
                  {products.length} Premium Product{products.length !== 1 ? 's' : ''}
                </span>
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-purple-600 font-medium">
                  Quality Guaranteed
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Section */}
      {!loading && products.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md border-y border-purple-200 sticky top-0 z-30 shadow-sm">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-purple-700 font-semibold">
                  {products.length} Products
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <SortAsc className="w-4 h-4 text-purple-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border-2 border-purple-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-300 shadow-sm hover:shadow-md w-full sm:min-w-[160px]"
                >
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 lg:py-24">
            <div 
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 max-w-md mx-auto shadow-xl border border-purple-200"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(250,245,255,.98) 60%, rgba(245,240,255,.98) 100%)",
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-200 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-purple-800 mb-4">
                Collection Empty
              </h3>
              <p className="text-base text-purple-600 mb-6 leading-relaxed">
                We're curating the perfect {categoryName} collection for you. Check back soon for premium additions!
              </p>
              <Button
                variant="outline"
                className="rounded-full px-8 py-3 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold"
                onClick={() => window.history.back()}
              >
                ← Return to Collections
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Premium Products Grid */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              {sortedProducts.map((product, index) => {
                const originalPrice = Math.round(product.Product_price * 1.2);
                const discount = calculateDiscount(product.Product_price, originalPrice);
                const isHovered = hoveredProduct === product._id;
                const inWishlist = isInWishlist(product._id);

                return (
                  <motion.div
                    key={product._id}
                    className="group rounded-xl border border-purple-200 shadow-lg hover:shadow-2xl hover:shadow-purple-300/20 transition-all duration-500 overflow-hidden flex flex-col hover:-translate-y-2 hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(250,245,255,.98) 60%, rgba(245,240,255,.98) 100%)",
                    }}
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    {/* Product Image */}
                    <div
                      className="relative aspect-square overflow-hidden cursor-pointer rounded-t-xl bg-gradient-to-br from-purple-50 to-white"
                      onClick={() => handleProductClick(product._id)}
                    >
                      <img
                        src={product.Product_image[0]}
                        alt={product.Product_name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      {/* Overlay effects */}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Premium Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.isNew && (
                          <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                            <Sparkles size={8} className="inline mr-1" />
                            NEW
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                            {discount}% OFF
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className={`w-8 h-8 rounded-full backdrop-blur-md border transition-all duration-300 ${
                            inWishlist
                              ? "bg-gradient-to-r from-rose-500 to-pink-500 border-rose-400/50 text-white hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-300/40"
                              : "bg-white/80 border-purple-200 text-purple-600 hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 hover:border-rose-400/50 hover:text-white"
                          } ${isHovered ? 'scale-110 shadow-xl' : 'shadow-lg'}`}
                          onClick={(e) => handleWishlistToggle(e, product)}
                        >
                          <Heart
                            size={13}
                            fill={inWishlist ? "currentColor" : "none"}
                          />
                        </Button>
                        
                        <Button
                          variant="secondary"
                          size="icon"
                          className={`w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border-purple-200 text-purple-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 hover:text-white hover:border-purple-400/50 transition-all duration-300 shadow-lg ${
                            isHovered ? 'scale-110 shadow-xl' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product._id);
                          }}
                        >
                          <Eye size={13} />
                        </Button>
                      </div>

                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200 ease-out" />
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex-grow flex flex-col bg-transparent">
                      <div className="mb-3">
                        <h3
                          className="font-bold text-sm text-purple-800 line-clamp-2 leading-tight cursor-pointer hover:text-purple-700 transition-colors mb-2 min-h-[40px]"
                          onClick={() => handleProductClick(product._id)}
                        >
                          {product.Product_name}
                        </h3>
                      </div>

                      <div className="mt-auto">
                        {/* Price Section */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base font-bold text-purple-900">
                            ₹{product.Product_price.toLocaleString()}
                          </span>
                          {discount > 0 && (
                            <span className="text-xs text-purple-500 line-through bg-purple-100 px-2 py-0.5 rounded-full">
                              ₹{originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          className="w-full rounded-xl py-2.5 text-xs font-semibold bg-purple-900 hover:bg-purple-800 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-300/30 border border-purple-700 backdrop-blur-sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart size={13} className="mr-1 group-hover:scale-110 transition-transform" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Premium Results Summary */}
            <motion.div 
              className="text-center mt-16 pt-8 border-t border-purple-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 px-8 py-4 rounded-full text-sm font-bold shadow-lg border border-purple-200">
                <Crown className="w-5 h-5" />
                Discovered {products.length} premium product{products.length !== 1 ? 's' : ''} in {categoryName}
              </div>
            </motion.div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;