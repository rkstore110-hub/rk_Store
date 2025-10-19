import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosConfig";
import {
  Heart,
  ChevronRight,
  X,
  Truck,
  Shield,
  RotateCcw,
  ZoomIn,
  Check,
  ShoppingCart,
  Award,
  Minus,
  Plus,
  Star,
  ChevronLeft,
  Sparkles,
  Gem,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { useAuth } from "@/components/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  _id: string;
  Product_name: string;
  Product_discription: string;
  Product_price: number;
  Product_image: string[];
  Product_category: {
    category: string;
    slug: string;
  };
  Product_available?: boolean;
  Product_rating?: number;
  isNew?: boolean;
}

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const transformProductForWishlist = (prod: Product) => ({
    _id: prod._id,
    Product_name: prod.Product_name,
    Product_price: prod.Product_price,
    Product_image: prod.Product_image,
    category: prod.Product_category?.category,
    description: prod.Product_discription,
    Product_available: prod.Product_available,
  });

  const transformProductForCart = (prod: Product, qty: number = 1) => {
    return {
      id: parseInt(prod._id.slice(-8), 16),
      _id: prod._id,
      name: prod.Product_name,
      Product_name: prod.Product_name,
      price: `₹${prod.Product_price}`,
      Product_price: prod.Product_price,
      originalPrice: `₹${Math.round(prod.Product_price * 1.3)}`,
      image: prod.Product_image[0] || "",
      Product_image: prod.Product_image,
      isNew: prod.isNew || false,
      quantity: qty,
      Product_available: prod.Product_available,
    };
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;

    if (user) {
      const wasInWishlist = isInWishlist(product._id);
      const transformedProduct = transformProductForWishlist(product);
      toggleWishlist(transformedProduct);

      toast({
        title: wasInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: wasInWishlist
          ? `${product.Product_name} removed from your wishlist`
          : `${product.Product_name} added to your wishlist`,
        duration: 2000,
      });
    } else {
      navigate("/login");
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartProduct = transformProductForCart(product, quantity);
    addToCart(cartProduct);

    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.Product_name} added to your cart`,
      duration: 2000,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/api/getproductbyid?id=${productId.trim()}`);
        
        if (res.data?.product) {
          setProduct(res.data.product);
          setSelectedImage(res.data.product.Product_image[0]);

          try {
            const relatedRes = await axiosInstance.get(
              `/api/getproducts?category=${res.data.product.Product_category.slug}&limit=8`
            );
            
            const filtered = relatedRes.data.products?.filter(
              (p: Product) => p._id !== res.data.product._id
            ) || [];
            setRelatedProducts(filtered.slice(0, 6));
          } catch (relatedError) {
            console.error("Failed to load related products:", relatedError);
            setRelatedProducts([]);
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Failed to load product:", error);
        setProduct(null);
        toast({
          title: "Error loading product",
          description: "Failed to load product details. Please try again.",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, toast]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [productId]);

  const originalPrice = product ? Math.round(product.Product_price * 1.3) : 0;
  const discount = product
    ? Math.round(((originalPrice - product.Product_price) / originalPrice) * 100)
    : 0;

  const RatingDisplay = ({ rating = 4.5 }: { rating?: number }) => {
    const rounded = Math.round(rating);
    return (
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${
              i < rounded 
                ? "fill-purple-400 text-purple-400" 
                : "fill-purple-200 text-purple-200"
            }`}
          />
        ))}
        <span className="text-sm text-purple-600 ml-2">{rating.toFixed(1)}</span>
        <span className="text-sm text-purple-400">•</span>
        <span className="text-sm text-purple-400">42 Reviews</span>
      </div>
    );
  };

  const RelatedProductCard = ({ product: relatedProduct }: { product: Product }) => (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="flex-shrink-0 w-48 sm:w-56 cursor-pointer group"
      onClick={() => navigate(`/product/${relatedProduct._id}`)}
    >
      <Card className="h-full border border-purple-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
        <div 
          className="relative aspect-square overflow-hidden bg-gradient-to-br from-white via-purple-50 to-purple-100"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(250,245,255,.98) 60%, rgba(245,240,255,.98) 100%)",
          }}
        >
          <img
            src={relatedProduct.Product_image[0] || "/fallback.jpg"}
            alt={relatedProduct.Product_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white/80" />
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (user) {
                toggleWishlist(transformProductForWishlist(relatedProduct));
              } else {
                navigate("/login");
              }
            }}
          >
            <Heart
              size={14}
              className={`${
                isInWishlist(relatedProduct._id)
                  ? "fill-rose-500 text-rose-500"
                  : "text-purple-400"
              }`}
            />
          </Button>

          {relatedProduct.isNew && (
            <Badge className="absolute top-2 left-2 bg-purple-500 text-white border-0 font-semibold text-xs">
              NEW
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-purple-900 line-clamp-2 mb-2 leading-tight text-sm">
            {relatedProduct.Product_name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-purple-900 text-base">
                ₹{relatedProduct.Product_price.toLocaleString()}
              </span>
              <span className="text-xs text-purple-400 line-through">
                ₹{Math.round(relatedProduct.Product_price * 1.3).toLocaleString()}
              </span>
            </div>
            <Badge className="bg-purple-100 text-purple-800 border-0 text-xs font-semibold">
              {Math.round(((Math.round(relatedProduct.Product_price * 1.3) - relatedProduct.Product_price) / Math.round(relatedProduct.Product_price * 1.3)) * 100)}% OFF
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-purple-100">
        <div className="text-center space-y-4 px-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto"
          />
          <p className="text-purple-600 font-medium text-lg">
            Loading Premium Product...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-purple-100 p-4">
        <Card className="p-8 text-center max-w-md w-full shadow-2xl border border-purple-200 bg-white/95 backdrop-blur-sm">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-purple-50 rounded-full flex items-center justify-center">
              <X className="text-purple-400 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-purple-900">
              Product Not Found
            </h2>
            <p className="text-purple-600">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate("/")}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
              >
                Browse Collections
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div 
        className="min-h-screen"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 40%, #f3e8ff 100%)",
        }}
      >
        {/* Enhanced Image Modal */}
        <AnimatePresence>
          {showImageModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setShowImageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-6xl max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute -top-16 right-0 text-white hover:text-purple-300 transition-colors bg-black/50 backdrop-blur-sm rounded-full p-3 z-10"
                >
                  <X size={24} />
                </button>

                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={selectedImage!}
                    alt="Product zoom view"
                    className="w-full max-h-[80vh] object-contain"
                    onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                  />
                </div>

                <div className="flex justify-center mt-6 space-x-3 max-w-full overflow-x-auto px-2">
                  {product.Product_image.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-3 transition-all ${
                        selectedImage === img
                          ? "border-purple-400 ring-4 ring-purple-300/50"
                          : "border-white/50 hover:border-purple-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Premium Breadcrumb */}
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-purple-500 mb-8"
          >
            <Link to="/" className="hover:text-purple-600 transition-colors font-medium">
              Home
            </Link>
            <ChevronRight size={16} />
            <Link 
              to={`/category/${product.Product_category.slug}`}
              className="hover:text-purple-600 transition-colors font-medium"
            >
              {product.Product_category.category}
            </Link>
            <ChevronRight size={16} />
            <span className="text-purple-900 font-semibold truncate">
              {product.Product_name}
            </span>
          </motion.nav>

          {/* Main Product Grid */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Main Image */}
              <Card className="overflow-hidden border border-purple-200 shadow-lg bg-white">
                <div className="relative group aspect-square bg-gradient-to-br from-white via-purple-50 to-purple-100">
                  <motion.img
                    src={selectedImage!}
                    alt={product.Product_name}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                    onClick={() => setShowImageModal(true)}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Enhanced Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {discount > 0 && (
                      <Badge className="bg-purple-500 text-white font-semibold px-3 py-1.5 shadow-lg border-0">
                        {discount}% OFF
                      </Badge>
                    )}
                    {product.isNew && (
                      <Badge className="bg-emerald-500 text-white font-semibold px-3 py-1.5 shadow-lg border-0">
                        <Sparkles size={12} className="mr-1" />
                        NEW
                      </Badge>
                    )}
                    <Badge className={`font-semibold px-3 py-1.5 shadow-lg border-0 ${
                      product.Product_available
                        ? "bg-emerald-500 text-white"
                        : "bg-purple-500 text-white"
                    }`}>
                      <Check size={12} className="mr-1" />
                      {product.Product_available ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleWishlistToggle}
                      className={`w-10 h-10 rounded-full backdrop-blur-sm ${
                        isInWishlist(product._id)
                          ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
                          : "bg-white/90 text-purple-600 hover:bg-white"
                      }`}
                    >
                      <Heart size={18} fill={isInWishlist(product._id) ? "currentColor" : "none"} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowImageModal(true)}
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-purple-600 hover:bg-white"
                    >
                      <ZoomIn size={18} />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-4">
                {product.Product_image.map((img, idx) => (
                  <Card
                    key={idx}
                    className={`overflow-hidden cursor-pointer border-2 transition-all duration-300 hover:scale-105 ${
                      selectedImage === img
                        ? "border-purple-400 ring-2 ring-purple-200 shadow-lg"
                        : "border-purple-200 hover:border-purple-300"
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <div className="aspect-square bg-gradient-to-br from-purple-50 to-purple-100">
                      <img
                        src={img}
                        alt={`View ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="p-8 border border-purple-200 shadow-xl bg-white">
                <CardContent className="p-0 space-y-6">
                  {/* Header */}
                  <div>
                    <Badge className="mb-3 bg-purple-100 text-purple-800 border-0 font-semibold">
                      {product.Product_category.category}
                    </Badge>
                    <h1 className="text-3xl lg:text-4xl font-bold text-purple-900 leading-tight mb-4">
                      {product.Product_name}
                    </h1>
                    <RatingDisplay rating={product.Product_rating} />
                  </div>

                  {/* Price Section */}
                  <div className="space-y-3 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-100">
                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-bold text-purple-900">
                        ₹{product.Product_price.toLocaleString()}
                      </span>
                      {discount > 0 && (
                        <>
                          <span className="text-xl text-purple-400 line-through">
                            ₹{originalPrice.toLocaleString()}
                          </span>
                          <Badge className="bg-emerald-100 text-emerald-800 font-semibold text-sm">
                            Save ₹{(originalPrice - product.Product_price).toLocaleString()}
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-purple-600">
                      Inclusive of all taxes • Free shipping • Premium packaging
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-purple-700">Quantity:</span>
                      <div className="flex items-center border-2 border-purple-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors font-medium disabled:opacity-50"
                          disabled={quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-6 py-3 bg-white border-x-2 border-purple-200 font-semibold min-w-[60px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                          className="px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors font-medium disabled:opacity-50"
                          disabled={quantity >= 10}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={handleAddToCart}
                        disabled={!product.Product_available}
                        className="flex-1 h-14 text-base font-semibold bg-purple-900 hover:bg-purple-800 text-white shadow-lg hover:shadow-xl transition-all border-0"
                      >
                        <ShoppingCart className="mr-3" size={20} />
                        Add to Cart
                      </Button>
                      <Button
                        onClick={handleBuyNow}
                        disabled={!product.Product_available}
                        className="flex-1 h-14 text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                      >
                        Buy Now
                      </Button>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {[
                      { icon: Truck, text: "Free Shipping", subtext: "2-3 days" },
                      { icon: Shield, text: "2-Year Warranty", subtext: "Full coverage" },
                      { icon: RotateCcw, text: "30-Day Returns", subtext: "No questions" },
                      { icon: Award, text: "Premium Quality", subtext: "Certified" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <item.icon size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-purple-900 text-sm">{item.text}</p>
                          <p className="text-xs text-purple-500">{item.subtext}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-purple-200 shadow-xl bg-white overflow-hidden">
              <div className="border-b border-purple-200">
                <div className="flex">
                  {[
                    { key: "description", label: "Product Description" },
                    { key: "specifications", label: "Details & Care" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-8 py-4 font-semibold text-base transition-all duration-300 relative ${
                        activeTab === tab.key
                          ? "text-purple-600 bg-purple-50 border-b-2 border-purple-500"
                          : "text-purple-600 hover:text-purple-600 hover:bg-purple-50/50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <CardContent className="p-8">
                {activeTab === "description" && (
                  <div className="prose prose-stone max-w-none">
                    <p className="text-purple-700 leading-relaxed text-lg whitespace-pre-line">
                      {product.Product_discription}
                    </p>
                    <div className="mt-6 p-6 bg-purple-50 rounded-2xl border-l-4 border-purple-400">
                      <div className="flex items-start gap-3">
                        <Crown className="text-purple-600 mt-1 flex-shrink-0" size={20} />
                        <div>
                          <h4 className="font-semibold text-purple-900 mb-2">Premium Quality Guarantee</h4>
                          <p className="text-purple-800 text-sm">
                            Every piece is meticulously crafted and undergoes rigorous quality checks 
                            to ensure exceptional durability and timeless elegance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-4 text-lg">Product Details</h4>
                      <div className="space-y-3">
                        {[
                          { label: "Category", value: product.Product_category.category },
                          { label: "Material", value: "Premium Materials" },
                          { label: "Warranty", value: "2 Years" },
                          { label: "Return Policy", value: "30 Days" },
                        ].map((spec, idx) => (
                          <div key={idx} className="flex justify-between py-2 border-b border-purple-100">
                            <span className="font-medium text-purple-600">{spec.label}</span>
                            <span className="font-semibold text-purple-900">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-4 text-lg">Care Instructions</h4>
                      <div className="space-y-3 text-purple-700">
                        <p>• Store in original packaging when not in use</p>
                        <p>• Clean with soft, dry cloth regularly</p>
                        <p>• Avoid exposure to harsh chemicals</p>
                        <p>• Professional cleaning recommended annually</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-20"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-purple-900 mb-4">
                  Complete Your Collection
                </h2>
                <p className="text-purple-600 text-lg max-w-2xl mx-auto">
                  Discover more exquisite pieces that complement your style
                </p>
              </div>

              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {relatedProducts.map((relatedProduct) => (
                    <RelatedProductCard key={relatedProduct._id} product={relatedProduct} />
                  ))}
                </div>
              </div>

              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/category/${product.Product_category.slug}`)}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-3"
                >
                  Explore {product.Product_category.category} Collection
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;