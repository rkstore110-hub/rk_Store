import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Star, ShoppingCart, Eye, ChevronDown } from "lucide-react";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface ApiProduct {
  _id: string;
  Product_name: string;
  Product_price: number;
  Product_image: string[];
  Product_rating?: number;
  isNew?: boolean;
  Product_discription?: string;
  Product_description?: string;
  Product_available?: boolean;
  Product_category?: { category: string; slug?: string };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const currency = (n: number) => `₹${n.toLocaleString()}`;
const calcOriginal = (p: number) => Math.round(p * 1.2);
const calcDiscount = (price: number, originalPrice: number) =>
  Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100));

const RatingStars = React.memo(({ rating = 4.5 }: { rating?: number }) => {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1 mb-2 select-none text-sm" aria-label={`Rating ${rating} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true" style={{ display: "inline-block", width: 14, height: 14, marginRight: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={i < rounded ? "#F59E0B" : "none"} stroke={i < rounded ? "#D97706" : "#E5E5E5"}>
            <path d="M12 2l3 6 6 1-4.5 4.5 1 6-5.5-3-5.5 3 1-6L3 9l6-1 3-6z" fill={i < rounded ? "#F59E0B" : "none"} stroke={i < rounded ? "#D97706" : "#E5E5E5"} />
          </svg>
        </span>
      ))}
      <span className="text-xs text-stone-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
});

const ProductCard: React.FC<{
  product: ApiProduct;
  onClick: (id: string) => void;
  onWishlistToggle: (e: React.MouseEvent, product: ApiProduct) => void;
  onAddToCart: (product: ApiProduct) => void;
  inWishlist: boolean;
}> = React.memo(({ product, onClick, onWishlistToggle, onAddToCart, inWishlist }) => {
  const originalPrice = calcOriginal(product.Product_price);
  const discount = calcDiscount(product.Product_price, originalPrice);
  const [adding, setAdding] = useState(false);
  const handleAdd = () => {
    if (adding) return;
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => setAdding(false), 700);
  };
  const description = product.Product_description || product.Product_discription || "Handpicked jewelry with beautiful finishing touches.";

  return (
    <motion.div
      tabIndex={0}
      onClick={() => onClick(product._id)}
      className="group bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col focus:outline-none focus:ring-2 focus:ring-amber-200 overflow-hidden"
      aria-label={product.Product_name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 14px 28px rgba(0,0,0,.04)" }}
      transition={{ duration: 0.5 }}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(255,253,230,.98) 60%, rgba(254,248,200,.98) 100%)",
      }}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        {product.Product_image?.[0] ? (
          <img
            src={product.Product_image[0]}
            alt={product.Product_name}
            loading="lazy"
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            style={{ maxHeight: 230 }}
          />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 flex items-center justify-center rounded-t-xl select-none">
            No Image Available
          </div>
        )}
        
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white/80" />
        
        {/* Product Status Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {discount > 0 && (
            <Badge className="bg-amber-500 text-white font-semibold text-xs px-2 py-1 border-0">
              {discount}% OFF
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-emerald-500 text-white font-semibold text-xs px-2 py-1 border-0">
              NEW
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <button
          className={`absolute top-3 left-3 rounded-full p-2 bg-white/90 backdrop-blur-sm border border-amber-200 shadow-sm hover:bg-white transition-all duration-200 ${
            inWishlist ? "text-rose-500" : "text-stone-400 hover:text-rose-400"
          }`}
          onClick={e => { e.stopPropagation(); onWishlistToggle(e, product); }}
          aria-pressed={inWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
        </button>
        
        <button
          className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm shadow-sm border border-amber-200 rounded-full p-2 hover:bg-white transition-all duration-200 text-stone-600 hover:text-stone-800"
          onClick={e => { e.stopPropagation(); onClick(product._id); }}
          aria-label="View product"
        >
          <Eye size={18} />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-4 bg-transparent">
        <h3 className="text-lg font-semibold text-stone-900 truncate mb-1">{product.Product_name}</h3>
        <p className="text-sm text-stone-700 line-clamp-2 mb-3 leading-relaxed" title={description}>
          {description}
        </p>
        
        <div className="mt-auto">
          <RatingStars rating={product.Product_rating || 4.5} />
          
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-stone-900">{currency(product.Product_price)}</span>
              {discount > 0 && (
                <span className="text-sm line-through text-stone-400 font-medium">{currency(originalPrice)}</span>
              )}
            </div>
          </div>

          <Button
            onClick={e => { e.stopPropagation(); handleAdd(); }}
            disabled={adding}
            // size="md"
            className="w-full font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200 shadow-sm hover:shadow-md border-0"
          >
            <ShoppingCart size={18} className="mr-2" /> 
            {adding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const initialLimit = 10;
  const loadMoreCount = 10;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/getAllData`, { timeout: 10000 });
      if (Array.isArray(res.data?.data?.categories)) {
        setCategories(res.data.data.categories);
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  }, []);

  const fetchProducts = useCallback(
    async (limit: number, skip: number = 0, append: boolean = false, categorySlug: string = "") => {
      try {
        append ? setLoadingMore(true) : setLoading(true);
        let url = `${API_URL}/api/getproducts?limit=${limit}&skip=${skip}`;
        if (categorySlug) url += `&category=${encodeURIComponent(categorySlug)}`;
        const res = await axios.get(url, { timeout: 10000 });
        const incoming: ApiProduct[] = res.data.products || [];
        setProducts(append ? (prev) => [...prev, ...incoming] : incoming);
        setTotalProducts(res.data.totalProducts || incoming.length);
        setHasMore(incoming.length === limit);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(initialLimit, 0, false, selectedCategory);
  }, [fetchProducts, selectedCategory]);

  const handleLoadMore = useCallback(() => {
    fetchProducts(loadMoreCount, products.length, true, selectedCategory);
  }, [fetchProducts, loadMoreCount, products.length, selectedCategory]);

  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent, product: ApiProduct) => {
      e.stopPropagation();
      if (!user) return navigate("/login");
      toggleWishlist(product);
      toast({
        title: isInWishlist(product._id) ? "Removed from wishlist" : "Added to wishlist",
        description: product.Product_name,
        duration: 1400,
      });
    },
    [isInWishlist, navigate, toggleWishlist, user]
  );

  const handleAddToCart = useCallback(
    (product: ApiProduct) => {
      if (!user) return navigate("/login");
      addToCart({
        id: parseInt(product._id.slice(-8), 16),
        _id: product._id,
        name: product.Product_name,
        price: currency(product.Product_price),
        originalPrice: currency(calcOriginal(product.Product_price)),
        image: product.Product_image[0] || "",
        isNew: product.isNew || false,
        quantity: 1,
      });
      toast({
        title: "Added to cart",
        description: product.Product_name,
        duration: 1600,
      });
    },
    [addToCart, navigate, user]
  );

  const handleProductClick = useCallback(
    (productId: string) => {
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  return (
    <section className="relative pt-24 pb-16" style={{ background: "white" }}>
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <motion.header
          className="mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl font-extrabold text-stone-900">
            Featured <span className="bg-amber-500 bg-clip-text text-transparent">Collections</span>
          </h2>
          <p className="mt-4 text-stone-700 text-lg max-w-md mx-auto">
            Handpicked selections with a clean, airy aesthetic for a modern look.
          </p>
          {totalProducts > 0 && (
            <p className="mt-2 text-amber-600 font-medium">
              Showing {products.length}
              {totalProducts > products.length ? ` of ${totalProducts}` : ''} exquisite pieces
            </p>
          )}
          <motion.div
            className="mt-8 flex justify-center"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          >
            <ChevronDown size={36} className="text-amber-600" />
          </motion.div>
        </motion.header>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Button 
            size="sm" 
            variant={selectedCategory === "" ? "default" : "outline"} 
            onClick={() => setSelectedCategory("")} 
            className="rounded-full px-6 py-2 font-medium transition-all duration-200 bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
          >
            All Collections
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat._id}
              size="sm"
              variant={selectedCategory === cat.slug ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.slug || "")}
              className="rounded-full px-6 py-2 font-medium transition-all duration-200 border-amber-200 text-stone-700 hover:bg-amber-50 hover:border-amber-300"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
          {products.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={handleProductClick}
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleAddToCart}
              inWishlist={isInWishlist(product._id)}
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="border-amber-300 text-stone-700 px-12 py-6 rounded-full font-semibold hover:bg-amber-50 hover:border-amber-400 transition-all duration-200 text-lg"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                "Discover More"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;