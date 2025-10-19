import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Crown, Sparkles, Gem, Shield } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/components/AuthContext";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  // Form fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle form submit for normal signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/signup`, {
        firstName: firstName || email.split("@")[0],
        email,
        password,
        confirmPassword,
      });

      const loginRes = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const data = loginRes.data;
      if (data.accessToken && data.reply) {
        localStorage.setItem("user_token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.reply));
        login(data.reply);

        toast({
          title: "Welcome to RK Store!",
          description: "Your premium account has been created successfully.",
        });

        navigate("/");
      } else {
        throw new Error("Failed to sign in automatically");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Registration failed",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Handle Google OAuth signup
  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 40%, #f3e8ff 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-200"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(250,245,255,.98) 60%, rgba(245,240,255,.98) 100%)",
          }}
        >
          {/* Header */}
          <div className="px-8 pt-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-purple-200"
            >
              <Crown className="w-4 h-4" />
              RK Store Premium
              <Gem className="w-4 h-4" />
            </motion.div>
            <h2 className="text-3xl font-bold text-purple-900 mb-2">Create Account</h2>
            <p className="text-purple-600 text-sm">Join our premium shopping experience</p>
          </div>

          {/* Signup Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="px-8 pb-8 space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-purple-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="h-12 bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-purple-700">
                Full Name
              </label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your full name"
                className="h-12 bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-purple-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a secure password"
                  className="pr-10 h-12 bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-500 hover:text-purple-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-purple-500">Minimum 8 characters with letters and numbers</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-700">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className="pr-10 h-12 bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-500 hover:text-purple-700"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-purple-800">
                <p className="font-medium">Secure Account</p>
                <p className="mt-1">Your information is protected with enterprise-grade security</p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-purple-500 focus:ring-purple-400 border-purple-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-purple-600">
                I agree to the{" "}
                <Link to={"/terms"} className="font-medium text-purple-600 hover:text-purple-700">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                "Create Premium Account"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-purple-500">Or continue with</span>
              </div>
            </div>

            {/* Google Auth Button */}
            <Button
              type="button"
              onClick={handleGoogleSignup}
              variant="outline"
              className="w-full h-12 rounded-xl border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </motion.form>

          {/* Footer */}
          <div className="px-8 pb-8 -mt-2">
            <p className="text-center text-sm text-purple-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-purple-600 hover:text-purple-700">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Premium Accent */}
          <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600" />
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;