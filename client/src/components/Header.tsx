import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, LayoutDashboard, Heart } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { TokenManager } from "@/utils/tokenManager";

// Reduced motion flag
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const MotionDiv = prefersReducedMotion ? "div" : motion.div;

// Logo: refined brand treatment
const LogoBrand = () => (
  <span className="inline-flex items-center gap-2" aria-label="RK Store Logo">
    <span
      className="w-9 h-9 rounded-full bg-gradient-to-br from-white/95 to-cream-100 shadow-md flex items-center justify-center border border-amber-200"
      style={{ fontWeight: 800, color: "#3b2f2f", fontSize: "0.9rem" }}
    >
      RK
    </span>
    <span className="hidden sm:inline-block font-semibold tracking-tight text-stone-800" style={{ fontSize: "1.05rem" }}>
      Store
    </span>
  </span>
);

const creamGradient = "bg-gradient-to-br from-white via-cream-50 to-cream-100";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const profileMenuRef = useRef(null);
  const searchResultsRef = useRef(null);
  const lastScrollY = useRef(0);
  const scrollRAF = useRef(null);

  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { getTotalItems } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();

  const navigationItems = useMemo(() => [], []);

  const totalQuantity = useMemo(
    () => cart?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
    [cart]
  );
  const totalWishlistItems = useMemo(
    () => (getTotalItems ? getTotalItems() : 0),
    [getTotalItems]
  );

  const fuseOptions = useMemo(
    () => ({
      keys: [
        { name: "Product_name", weight: 0.7 },
        { name: "Product_category.category", weight: 0.2 },
        { name: "Product_discription", weight: 0.1 },
      ],
      threshold: 0.5,
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: false,
      ignoreLocation: true,
      shouldSort: true,
      isCaseSensitive: false,
      distance: 100,
    }),
    []
  );

  const fuse = useMemo(() => {
    if (products.length === 0) return null;
    return new Fuse(products, fuseOptions);
  }, [products, fuseOptions]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecentSearches(Array.isArray(parsed) ? parsed.slice(0, 5) : []);
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";
        const response = await fetch(`${API_URL}/api/getproducts`, { credentials: "include" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const productArray = Array.isArray(data.products) ? data.products : [];
        if (alive) setProducts(productArray);
      } catch {
        if (alive) setProducts([]);
      } finally {
        if (alive) setProductsLoading(false);
      }
    };
    fetchProducts();
    return () => {
      alive = false;
    };
  }, []);

  const performSearch = useCallback(
    (query) => {
      if (!query || !fuse) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }
      setIsSearching(true);
      setShowSearchResults(true);
      try {
        const searchResponse = fuse.search(query);
        const results = searchResponse.slice(0, 6).map((r) => r.item);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [fuse]
  );

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const q = searchQuery.trim();
      if (!q) return;
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setShowSearchResults(false);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
    },
    [navigate, searchQuery]
  );

  const handleProductClick = useCallback(
    (productId) => {
      navigate(`/product/${productId}`);
      setShowSearchResults(false);
      setIsMobileSearchOpen(false);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    toast({ title: "Logged out successfully", description: "Come back soon!", variant: "default" });
    navigate("/");
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [logout, toast, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (searchResultsRef.current && !searchResultsRef.current.contains(target)) {
        setShowSearchResults(false);
      }
    };

    const onScroll = () => {
      if (scrollRAF.current) return;
      scrollRAF.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        setShowNavbar(currentScrollY <= lastScrollY.current || currentScrollY <= 60);
        lastScrollY.current = currentScrollY;
        scrollRAF.current && cancelAnimationFrame(scrollRAF.current);
        scrollRAF.current = null;
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", onScroll);
      if (scrollRAF.current) cancelAnimationFrame(scrollRAF.current);
      scrollRAF.current = null;
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isMobileMenuOpen || isMobileSearchOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  useEffect(() => {
    const checkAdminStatus = () => {
      const adminToken = TokenManager.getToken("admin");
      const userRole =
        user?.role === "admin" ||
        localStorage.getItem("user_role") === "admin" ||
        (() => {
          try {
            const parsedAdmin = JSON.parse(localStorage.getItem("admin_user") || "{}");
            return parsedAdmin?.role === "admin";
          } catch {
            return false;
          }
        })();
      setIsAdmin(Boolean(adminToken) && Boolean(userRole));
    };
    checkAdminStatus();
    window.addEventListener("storage", checkAdminStatus);
    return () => window.removeEventListener("storage", checkAdminStatus);
  }, [user]);

  // Logo variant
  const Logo = () => (
    <span className="inline-flex items-center gap-2">
      <LogoBrand />
    </span>
  );

  return (
    <>
      <MotionDiv
        initial={prefersReducedMotion ? undefined : { y: -100 }}
        animate={prefersReducedMotion ? undefined : { y: showNavbar ? 0 : -100 }}
        transition={prefersReducedMotion ? undefined : { type: "tween", duration: 0.18 }}
        className={`fixed top-0 left-0 right-0 z-50 ${creamGradient} bg-white/95 backdrop-blur-sm border-b border-amber-200/60 shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo Area */}
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 focus:outline-none group"
                aria-label="Go to homepage"
              >
                <Logo />
              </button>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 mx-8 relative" ref={searchResultsRef}>
              <div className="w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  placeholder="Search products..."
                  className="w-full pl-11 pr-4 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all duration-200 text-sm placeholder-stone-400 shadow-sm"
                />
                <AnimatePresence>
                  {showSearchResults && (
                    <MotionDiv
                      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
                      transition={prefersReducedMotion ? undefined : { duration: 0.15 }}
                      className="absolute top-full mt-2 bg-white border border-amber-200 rounded-xl w-full z-50 shadow-xl max-h-80 overflow-hidden"
                    >
                      {isSearching ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
                          <p className="text-sm text-stone-500 mt-2">Searching...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="p-2 max-h-80 overflow-y-auto">
                          {searchResults.map((product) => (
                            <button
                              key={product._id}
                              onClick={() => handleProductClick(product._id)}
                              className="w-full p-3 hover:bg-amber-50/50 cursor-pointer rounded-lg transition-colors flex items-center space-x-3"
                            >
                              <img
                                loading="lazy"
                                decoding="async"
                                width={48}
                                height={48}
                                src={product.Product_image?.[0] || "/api/placeholder/48/48"}
                                alt={product.Product_name}
                                className="w-10 h-10 object-cover rounded-lg"
                                onError={e => {
                                  e.currentTarget.src = "/api/placeholder/48/48";
                                }}
                              />
                              <div className="flex-1 text-left min-w-0">
                                <h4 className="font-medium text-stone-900 truncate text-sm">{product.Product_name}</h4>
                                <p className="text-amber-700 font-medium text-sm">₹{product.Product_price?.toLocaleString()}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : searchQuery && !isSearching ? (
                        <div className="p-6 text-center">
                          <Search className="mx-auto h-8 w-8 text-stone-300 mb-2" strokeWidth={1.5} />
                          <p className="text-sm text-stone-500">No products found</p>
                        </div>
                      ) : null}
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-1 lg:space-x-3">
              {/* Mobile Search */}
              <button
                className="md:hidden p-2 text-stone-600 hover:text-amber-700 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              {/* Admin */}
              {isAdmin && (
                <div className="relative group hidden lg:block">
                  <button
                    className="px-4 py-2 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    onClick={() => navigate("/admin")}
                  >
                    <LayoutDashboard size={16} className="inline-block mr-2" strokeWidth={1.5} />
                    Admin
                  </button>
                </div>
              )}

              {/* Wishlist (desktop) */}
              <button
                className="hidden md:flex p-2 text-stone-700 hover:text-amber-700 transition-colors rounded-lg hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 relative"
                onClick={() => navigate("/wishlist")}
                aria-label={`Wishlist with ${totalWishlistItems} items`}
              >
                <Heart size={20} strokeWidth={1.5} />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-amber-700 rounded-full">
                    {totalWishlistItems > 99 ? "99+" : totalWishlistItems}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                className="p-2 text-stone-700 hover:text-amber-700 transition-colors rounded-lg hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 relative"
                onClick={() => navigate("/cart")}
                aria-label={`Shopping cart with ${totalQuantity} items`}
              >
                <ShoppingCart size={20} strokeWidth={1.5} />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-rose-600 rounded-full">
                    {totalQuantity > 99 ? "99+" : totalQuantity}
                  </span>
                )}
              </button>

              {/* Desktop Auth */}
              <div className="hidden md:flex items-center">
                {!isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate("/login")}
                      className="px-4 py-2 text-stone-800 hover:text-amber-800 transition-colors text-sm font-medium rounded-lg hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate("/signup")}
                      className="px-4 py-2 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      className="p-2 text-stone-700 hover:text-amber-700 transition-colors rounded-lg hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      onClick={() => setIsProfileMenuOpen((s) => !s)}
                      aria-label="User menu"
                    >
                      <User size={20} strokeWidth={1.5} />
                    </button>
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <MotionDiv
                          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.96 }}
                          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                          exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.96 }}
                          transition={prefersReducedMotion ? undefined : { duration: 0.15 }}
                          className="absolute right-0 mt-2 w-48 bg-white border border-amber-200 rounded-xl shadow-xl z-50 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-amber-100 bg-amber-50/60">
                            <p className="text-sm font-medium text-stone-900 truncate">{user?.firstName || user?.email}</p>
                            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                          </div>
                          <div className="py-1">
                            <button
                              onClick={() => {
                                navigate("/profile");
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-amber-50 transition-colors"
                            >
                              My Profile
                            </button>
                            <button
                              onClick={() => {
                                navigate("/orders");
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-amber-50 transition-colors"
                            >
                              My Orders
                            </button>
                            <button
                              onClick={() => {
                                navigate("/wishlist");
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-amber-50 transition-colors flex items-center justify-between"
                            >
                              My Wishlist
                              {totalWishlistItems > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-amber-700 rounded-full">
                                  {totalWishlistItems > 9 ? "9+" : totalWishlistItems}
                                </span>
                              )}
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  navigate("/admin");
                                  setIsProfileMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-amber-800 hover:bg-amber-100 transition-colors border-t border-amber-100"
                              >
                                Admin Panel
                              </button>
                            )}
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-3 text-sm text-rose-700 hover:bg-rose-50 transition-colors border-t border-amber-100"
                            >
                              Logout
                            </button>
                          </div>
                        </MotionDiv>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-stone-700 hover:text-amber-700 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                onClick={() => setIsMobileMenuOpen((s) => !s)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <MotionDiv
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center p-4 border-b border-amber-200 bg-white">
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 text-stone-700 hover:text-stone-900 transition-colors rounded-lg mr-2"
                  aria-label="Close search"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} strokeWidth={1.5} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 bg-amber-50/40 border border-amber-200 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isSearching ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="w-full p-4 hover:bg-amber-50 rounded-lg transition-colors flex items-center space-x-3 text-left"
                      >
                        <img
                          loading="lazy"
                          decoding="async"
                          width={48}
                          height={48}
                          src={product.Product_image?.[0] || "/api/placeholder/48/48"}
                          alt={product.Product_name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={e => {
                            e.currentTarget.src = "/api/placeholder/48/48";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-stone-900 truncate">{product.Product_name}</h4>
                          <p className="text-amber-700 font-medium text-sm">
                            ₹{product.Product_price?.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery && !isSearching ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Search className="h-12 w-12 text-stone-300 mb-4" strokeWidth={1.5} />
                    <h3 className="text-lg font-medium text-stone-900 mb-2">No results found</h3>
                    <p className="text-stone-500">Try searching with different keywords</p>
                  </div>
                ) : null}
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MotionDiv
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/50 md:hidden"
            onClick={e => e.target === e.currentTarget && setIsMobileMenuOpen(false)}
          >
            <MotionDiv
              initial={prefersReducedMotion ? undefined : { x: "100%" }}
              animate={prefersReducedMotion ? undefined : { x: 0 }}
              exit={prefersReducedMotion ? undefined : { x: "100%" }}
              transition={prefersReducedMotion ? undefined : { type: "tween", duration: 0.25 }}
              className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-amber-50/60">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-stone-900">Menu</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-stone-700 hover:text-stone-900 transition-colors rounded-lg"
                    aria-label="Close menu"
                  >
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Menu Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-2">
                    <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                      Navigation
                    </h3>
                    <button
                      onClick={() => {
                        navigate("/wishlist");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-3 rounded-lg font-medium transition-colors text-stone-700 hover:bg-amber-50 justify-between"
                    >
                      <div className="flex items-center">
                        <Heart size={18} className="mr-3" strokeWidth={1.5} />
                        My Wishlist
                      </div>
                    </button>
                  </div>

                  {/* Admin */}
                  {isAdmin && (
                    <div className="px-4 pb-4 border-t border-amber-200 mt-4 pt-4">
                      <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                        Admin
                      </h3>
                      <button
                        onClick={() => {
                          navigate("/admin");
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg font-medium transition-colors"
                      >
                        <LayoutDashboard size={18} className="mr-3" strokeWidth={1.5} />
                        Admin Dashboard
                      </button>
                    </div>
                  )}

                  {/* Auth */}
                  <div className="px-4 pb-4 border-t border-amber-200 mt-4 pt-4">
                    {!isAuthenticated ? (
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                          Account
                        </h3>
                        <button
                          onClick={() => {
                            navigate("/login");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full py-3 border border-amber-300 text-stone-800 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            navigate("/signup");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full py-3 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-all"
                        >
                          Create Account
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="px-4 py-3 bg-amber-50 rounded-lg mb-3">
                          <p className="text-sm font-medium text-stone-900 truncate">
                            {user?.firstName || "User"}
                          </p>
                          <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-stone-700 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          My Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate("/orders");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-stone-700 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          My Orders
                        </button>
                        <button
                          onClick={() => {
                            navigate("/wishlist");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-stone-700 hover:bg-amber-50 rounded-lg transition-colors flex items-center justify-between"
                        >
                          My Wishlist
                          {totalWishlistItems > 0 && (
                            <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-amber-700 rounded-full">
                              {totalWishlistItems > 9 ? "9+" : totalWishlistItems}
                            </span>
                          )}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              navigate("/admin");
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-amber-800 hover:bg-amber-100 transition-colors border-t border-amber-100"
                          >
                            Admin Panel
                          </button>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-rose-700 hover:bg-rose-50 transition-colors border-t border-amber-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-amber-200 bg-amber-50/60">
                  <p className="text-xs text-center text-stone-500">© 2025 RK Store. All rights reserved.</p>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
