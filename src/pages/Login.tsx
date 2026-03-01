import { Link } from "react-router-dom";
import { Building2, Home } from "lucide-react";
import { motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm";

/**
 * Login Page Component
 * 
 * Handles user authentication with Google Sign-In and Email/Password (for admins)
 * 
 * Requirements: 1.2, 1.3, 1.5, 2.1, 21.4
 */
const Login = () => {
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

          {/* Login Form Component */}
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
