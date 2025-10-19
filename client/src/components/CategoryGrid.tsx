import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  productCount?: number;
}

const CategoryGridModern: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/getAllData`, { withCredentials: true });
        setCategories(data?.data?.categories ?? []);
        setError(null);
      } catch {
        setError("Unable to load categories.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Mouse drag handlers for horizontal scroll
  const onMouseDown = (e: React.MouseEvent) => {
    if (scrollRef.current) {
      isDragging.current = true;
      scrollRef.current.classList.add("dragging");
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft.current = scrollRef.current.scrollLeft;
    }
  };

  const onMouseLeave = () => {
    if (scrollRef.current) {
      isDragging.current = false;
      scrollRef.current.classList.remove("dragging");
    }
  };

  const onMouseUp = () => {
    if (scrollRef.current) {
      isDragging.current = false;
      scrollRef.current.classList.remove("dragging");
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // scroll-fast
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  if (loading) {
    return (
      <section className="py-16 bg-white/90 text-center">
        <h3 className="mb-8 text-3xl font-extrabold text-purple-700">Loading Categories...</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 max-w-7xl mx-auto px-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl bg-purple-100 animate-pulse" />
            ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-white/95 flex flex-col items-center justify-center min-h-[300px]">
        <div className="max-w-md text-center bg-white shadow rounded-lg p-6">
          <p className="text-lg font-semibold mb-4 text-purple-700">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-24 pb-16" style={{ background: "white" }}>
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.header
          className="mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl font-extrabold text-purple-900">
            Discover <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">Premium Categories</span>
          </h2>
          <p className="mt-4 text-purple-700 text-lg max-w-md mx-auto">
            Handpicked selections with a clean, airy aesthetic for a modern look.
          </p>
          <motion.div
            className="mt-8 flex justify-center"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          >
            <ChevronDown size={36} className="text-purple-600" />
          </motion.div>
        </motion.header>

        {/* Horizontal scroll drag container with pristine white/lavender purple vibe */}
        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-pl-4 pb-6 cursor-grab"
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((category) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, boxShadow: "0 14px 28px rgba(0,0,0,.04)" }}
              transition={{ duration: 0.5 }}
              className="relative rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm flex-shrink-0 w-60 snap-center"
              onClick={() => navigate(`/category/${category.slug}`)}
              style={{
                scrollSnapAlign: "center",
                background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(250,245,255,.98) 60%, rgba(245,240,255,.98) 100%)",
              }}
            >
              <div className="aspect-square relative overflow-hidden rounded-xl">
                <img
                  src={category.image || "/fallback.jpg"}
                  alt={category.name}
                  className="object-cover w-full h-full transition-transform duration-500 ease-out hover:scale-105"
                  loading="lazy"
                />
                {/* Subtle soft shimmer gradient to add depth while staying white-mostly */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white/80" />
                <div className="absolute bottom-4 left-4 right-4 text-purple-900 z-10">
                  <h3 className="text-2xl font-semibold drop-shadow-sm">{category.name}</h3>
                  {category.productCount !== undefined && (
                    <Badge className="mt-2 bg-purple-100 text-purple-800 font-semibold">
                      {category.productCount} Items
                    </Badge>
                  )}
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white w-full" size="sm">
                    Shop Now <ShoppingCart className="inline ml-1" size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGridModern;