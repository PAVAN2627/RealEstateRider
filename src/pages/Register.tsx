import { Link } from "react-router-dom";
import { Building2, Home } from "lucide-react";
import { motion } from "framer-motion";
import RegisterForm from "@/components/auth/RegisterForm";

/**
 * Register Page Component
 * 
 * Handles user registration with Google Sign-In
 * 
 * Requirements: 1.1, 21.2
 */
const Register = () => {
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
            Create an account with Google and connect directly with property sellers. No brokers, no middlemen.
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

          {/* Register Form Component */}
          <RegisterForm />
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
