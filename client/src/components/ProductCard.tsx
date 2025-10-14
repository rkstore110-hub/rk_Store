import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Product {
  _id?: string;
  id: number;
  name: string;
  Product_name?: string;
  price: string;
  Product_price?: string;
  originalPrice: string;
  Product_originalPrice?: string;
  image: string;
  Product_image?: string[];
  rating: number;
  isNew?: boolean;
  Product_discription?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Function to calculate discount percentage
  const calculateDiscount = (priceStr: string, originalPriceStr: string) => {
    const price = parseInt(priceStr.replace(/[^\d]/g, ""));
    const originalPrice = parseInt(originalPriceStr.replace(/[^\d]/g, ""));
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    return discount;
  };

  const productId = product._id ? product._id : product.id;
  const productName = product.Product_name || product.name;
  const productPrice = product.Product_price || product.price;
  const productOriginalPrice = product.Product_originalPrice || product.originalPrice;
  const productImage = product.Product_image ? product.Product_image[0] : product.image;
  const productDescription = product.Product_discription || "";
  const productIsNew = product.isNew || false;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={productImage}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {productIsNew && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
            New
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 rounded-full z-10 transition-all ${
            isInWishlist(productId)
              ? "text-rose-500 hover:bg-rose-50/80"
              : "text-gray-400 hover:bg-white/80"
          }`}
          onClick={() => {
            if (user) {
              toggleWishlist(product);
              toast({ title: isInWishlist(productId) ? "Removed from wishlist" : "Added to wishlist", duration: 2000 });
            } else navigate("/login");
          }}
          aria-label="Toggle wishlist"
        >
          <Heart size={20} fill={isInWishlist(productId) ? "currentColor" : "none"} />
        </Button>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-3 flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight">{productName}</h3>

          <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded">
            <Star size={16} className="fill-amber-400 stroke-none" />
            <span className="text-sm font-semibold ml-1">{product.rating}</span>
          </div>
        </div>

        {productDescription && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{productDescription}</p>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-bold text-gray-900">{productPrice}</span>
            <span className="text-sm text-gray-500 line-through">{productOriginalPrice}</span>
            <span className="ml-auto text-sm font-semibold text-rose-500">
              {calculateDiscount(productPrice, productOriginalPrice)}% off
            </span>
          </div>

          <Button
            className="w-full rounded-lg py-5 font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all hover:scale-[1.02] shadow-md"
            onClick={() => {
              if (user) {
                // Format product data to match CartContext expectations
                const cartProduct = {
                  id: typeof product.id === 'number' ? product.id : parseInt(String(product.id).slice(-8), 16),
                  name: productName,
                  price: productPrice,
                  originalPrice: productOriginalPrice,
                  image: productImage,
                  rating: product.rating,
                  isNew: productIsNew
                };
                
                addToCart(cartProduct);
                toast({ 
                  title: "Added to cart", 
                  description: `${productName} added to your cart`,
                  duration: 3000 
                });
              } else {
                navigate("/login");
              }
            }}
          >
            <ShoppingCart size={18} className="mr-2" />
            Add to Cart
          </Button>
          <Button
            className="w-full mt-2 rounded-md py-3 font-semibold bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 transition-all hover:scale-[1.03] shadow-lg"
            onClick={() => {
              if (user) {
                // Implement buy now functionality here
                toast({ title: "Buy Now clicked", duration: 3000 });
              } else navigate("/login");
            }}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
