import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ShopByCategoryPage from "./pages/ShopByCategoryPage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import SearchResults from "@/components/SearchResults"; // Add this import
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import Products from "./pages/admin/Products";
import Users from "./pages/admin/Users";
import Banners from "./pages/admin/Banners";
import Categories from "./pages/admin/Categories";
import { AuthProvider } from "@/components/AuthContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { CartProvider } from "@/components/CartContext";
import MainLayout from "./components/MainLayout";
import Profile from "./pages/Profile";
import GoogleCallback from "./pages/GoogleCallback";
import Orders from "./pages/Orders";
import CustomHamperBuilder from "./pages/CustomHamperBuilder";
import PaymentCallback from './components/PaymentCallback';
import Privacy from './components/PRIVACY';
import Refund from './components/REFUND';
import Terms from "./components/TERMS";
import Contact from "./components/Contact";
import About from "./components/About"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Index />} />
                  <Route
                    path="category/:categoryName"
                    element={<CategoryPage />}
                  />
                  <Route
                    path="/product/:productId"
                    element={<ProductDetailPage />}
                  />
                  <Route path="search" element={<SearchResults />} /> {/* Add this route */}
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route
                    path="custom-hamper"
                    element={<CustomHamperBuilder />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/auth/google/callback"
                  element={<GoogleCallback />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="banners" element={<Banners />} />
                  <Route path="users" element={<Users />} />
                </Route>

                <Route path="profile" element={<Profile />} />
                <Route path="orders" element={<Orders />} />
                 <Route path="/payment/callback" element={<PaymentCallback />} />

                <Route path="*" element={<NotFound />} />
                 <Route path={"/privacy"} element={<Privacy/>}/>
                <Route path={"/refund"} element={<Refund/>}/>
                <Route path={"/terms"} element={<Terms></Terms>}/>
                <Route path={"/contact"} element={<Contact></Contact>} />
                <Route path={"/about"} element={<About/>}/>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
