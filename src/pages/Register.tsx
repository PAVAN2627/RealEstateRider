import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Mail, Lock, Eye, EyeOff, User, Briefcase, Phone, Home, Upload, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user.types";
import { toast } from "sonner";

/**
 * Register Page Component
 * 
 * Handles user registration with role selection and redirects to dashboard after successful registration.
 * 
 * Requirements: 1.1, 21.2
 */
const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller" | "agent" | "admin">("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [aadharDocument, setAadharDocument] = useState<File | null>(null);
  const [adminSecretKey, setAdminSecretKey] = useState("");

  /**
   * Redirect authenticated users to dashboard or pending approval page
   * Requirement 1.1: Redirect after successful registration
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      // All users with pending status go to pending approval page
      if (user.verificationStatus === 'pending') {
        navigate("/pending-approval", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  /**
   * Map UI role to UserRole enum
   */
  const mapToUserRole = (uiRole: "buyer" | "seller" | "agent" | "admin"): UserRole => {
    switch (uiRole) {
      case "buyer":
        return UserRole.BUYER;
      case "seller":
        return UserRole.SELLER;
      case "agent":
        return UserRole.AGENT;
      case "admin":
        return UserRole.ADMIN;
      default:
        return UserRole.BUYER;
    }
  };

  /**
   * Handle registration form submission
   * Requirements: 1.1, 21.2
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate name for non-admin users
    if (role !== "admin" && (!firstName || !lastName)) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate phone for all users
    if (!phone || phone.trim().length === 0) {
      toast.error("Phone number is required");
      return;
    }
    if (!/^[0-9]{10}$/.test(phone.trim())) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Validate admin secret key if role is admin
    if (role === "admin") {
      if (!adminSecretKey || adminSecretKey.trim().length === 0) {
        toast.error("Admin secret key is required");
        return;
      }
      if (adminSecretKey !== import.meta.env.VITE_ADMIN_SECRET_KEY) {
        toast.error("Invalid admin secret key");
        return;
      }
    }

    // Validate Aadhar document only for Sellers and Agents
    if ((role === "seller" || role === "agent") && !aadharDocument) {
      toast.error("Please upload your Aadhar document for verification");
      return;
    }

    setLoading(true);
    try {
      const userRole = mapToUserRole(role);
      const fullName = role === "admin" ? "Admin" : `${firstName} ${lastName}`.trim();
      const userId = await register(email, password, userRole, fullName, phone.trim());
      
      // Upload Aadhar document only for Sellers and Agents
      if ((role === "seller" || role === "agent") && aadharDocument && userId) {
        try {
          const { uploadAadharDocument } = await import("@/services/storageService");
          const { updateUserProfile } = await import("@/services/userService");
          const aadharUrl = await uploadAadharDocument(aadharDocument, userId);
          await updateUserProfile(userId, { aadharDocumentUrl: aadharUrl });
        } catch (uploadError: any) {
          console.error("Aadhar upload error:", uploadError);
          toast.error("Registration successful, but document upload failed. Please contact support.");
        }
      }
      
      // Show appropriate success message based on role
      if (role === "agent") {
        toast.success("Registration successful! Please wait for admin approval to access your account.");
      } else {
        toast.success("Registration successful! Welcome to RealEstateRider.");
      }
      // Navigation handled by useEffect
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please use a stronger password.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address");
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
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
            Start Your Real Estate
            <br />
            Journey Today
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Create an account and connect directly with property sellers. No brokers, no middlemen.
          </p>
        </motion.div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
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

          <h1 className="text-2xl font-bold font-heading text-foreground mb-1">Create an account</h1>
          <p className="text-muted-foreground mb-8">Join RealEstateRider and explore premium properties</p>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">I want to</label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { value: "buyer" as const, label: "Buy", icon: User },
                { value: "seller" as const, label: "Sell", icon: Building2 },
                { value: "agent" as const, label: "Be an Agent", icon: Briefcase },
                { value: "admin" as const, label: "Admin", icon: Shield },
              ]).map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    role === r.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <r.icon className={`w-5 h-5 mx-auto mb-1 ${role === r.value ? "text-primary" : "text-muted-foreground"}`} />
                  <div className={`text-xs font-semibold ${role === r.value ? "text-primary" : "text-foreground"}`}>{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name fields - Only for non-admin users */}
            {role !== "admin" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  />
                </div>
              </div>
            )}

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

            {/* Phone field - Only for non-admin users */}
            {role !== "admin" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
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

            {/* Admin Secret Key - Only shown when Admin role is selected */}
            {role === "admin" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Admin Secret Key <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="password" 
                    value={adminSecretKey}
                    onChange={(e) => setAdminSecretKey(e.target.value)}
                    placeholder="Enter admin secret key"
                    required={role === "admin"}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact system administrator for the admin secret key
                </p>
              </div>
            )}

            {/* Aadhar Document Upload - Only for Sellers and Agents */}
            {(role === "seller" || role === "agent") && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Aadhar Document (ID Proof) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file size (500KB max for Base64 storage)
                        if (file.size > 500 * 1024) {
                          toast.error("File size must be less than 500KB");
                          e.target.value = "";
                          return;
                        }
                        setAadharDocument(file);
                      }
                    }}
                    disabled={loading}
                    className="hidden"
                    id="aadhar-upload"
                  />
                  <label
                    htmlFor="aadhar-upload"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                      aadharDocument
                        ? "border-primary bg-primary/5"
                        : "border-input hover:border-primary/50"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {aadharDocument ? aadharDocument.name : "Upload Aadhar (JPG, PNG, PDF - Max 500KB)"}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Required for account verification. Your document will be reviewed by our admin team for security.
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground border-0 py-2.5"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
