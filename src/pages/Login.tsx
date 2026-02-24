import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Mail, Lock, Eye, EyeOff, User, Briefcase, Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/user.types";
import { toast } from "sonner";

type Role = "buyer" | "agent" | "admin";

const roles: { value: Role; label: string; icon: typeof User; desc: string; redirect: string }[] = [
  { value: "buyer", label: "Buyer / Seller", icon: User, desc: "Browse & list properties", redirect: "/dashboard" },
  { value: "agent", label: "Agent", icon: Briefcase, desc: "Manage listings & clients", redirect: "/dashboard" },
  { value: "admin", label: "Admin", icon: Shield, desc: "Platform management", redirect: "/admin" },
];

/**
 * Login Page Component
 * 
 * Handles user authentication with role-based redirects after successful login.
 * 
 * Requirements: 1.2, 1.3, 1.5, 2.1, 21.4
 */
const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Redirect authenticated users to appropriate dashboard
   * Requirement 1.5: Role-based redirect after login
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getRoleBasedRedirect(user.role);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  /**
   * Get redirect path based on user role
   * Requirement 2.1: Role-based access control
   */
  const getRoleBasedRedirect = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return "/admin";
      case UserRole.BUYER:
      case UserRole.SELLER:
      case UserRole.AGENT:
      default:
        return "/dashboard";
    }
  };

  /**
   * Handle login form submission
   * Requirements: 1.2, 1.3, 21.4
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");
      // Navigation handled by useEffect
    } catch (error: any) {
      console.error("Login error:", error);
      // Requirement 1.3: Display error for invalid credentials
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found") {
        toast.error("Invalid email or password");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many failed login attempts. Please try again later.");
      } else {
        toast.error(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold text-primary-foreground">
              RealEstate<span className="text-accent">Rider</span>
            </span>
          </div>
          <h2 className="text-4xl font-bold text-primary-foreground font-heading leading-tight mb-4">
            Your Gateway to
            <br />
            Premium Properties
          </h2>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Join thousands of buyers, sellers, and agents on India's most trusted real estate platform.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { val: "10K+", lbl: "Properties" },
              { val: "5K+", lbl: "Users" },
              { val: "500+", lbl: "Agents" },
            ].map((s) => (
              <div key={s.lbl} className="text-center p-4 rounded-xl bg-primary-foreground/10">
                <div className="text-xl font-bold text-primary-foreground font-heading">{s.val}</div>
                <div className="text-xs text-primary-foreground/60 mt-1">{s.lbl}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">
              RealEstate<span className="text-primary">Rider</span>
            </span>
          </div>

          {/* Back to Home Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-2xl font-bold font-heading text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          {/* Role Selector - Removed as role is determined by registration */}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-input" /> Remember me
              </label>
              <a href="#" className="text-primary font-medium hover:underline">Forgot password?</a>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground border-0 py-2.5"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Access - Removed for production */}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
