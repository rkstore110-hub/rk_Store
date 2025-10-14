import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log('🔍 AdminLogin - Attempting login with:', { email });
      
      // ✅ Use AuthContext login function properly
      const result = await login({ email, password });
      
      if (result.success && result.user) {
        // ✅ Check if user has admin permissions
        if (result.user.role === "admin" || result.user.role === "superadmin") {
          toast({
            title: "Login Successful",
            description: "Welcome back to the admin dashboard.",
            variant: "default",
          });
          navigate("/admin");
        } else {
          setError("Access Denied: Insufficient permissions for admin access.");
        }
      } else {
        setError(result.error || "Authentication failed. Please check your credentials and try again.");
      }
    } catch (err: any) {
      console.error('❌ AdminLogin error:', err);
      setError("Authentication failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      <div className="w-full max-w-md p-8">
        <div className="bg-white/80 dark:bg-black/50 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-purple-100 dark:border-gray-800">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white">Admin Login</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-body">Sign in to access the admin dashboard</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2 text-sm font-body">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-white/50 dark:bg-black/50 border-purple-100 dark:border-gray-800 focus:border-purple-300 dark:focus:border-purple-700"
                  placeholder="admin@example.com"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-white/50 dark:bg-black/50 border-purple-100 dark:border-gray-800 focus:border-purple-300 dark:focus:border-purple-700 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] font-body"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
