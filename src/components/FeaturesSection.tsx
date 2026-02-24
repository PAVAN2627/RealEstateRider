import { Shield, MapPin, Users, TrendingUp, Building2, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Verified Listings",
    description: "Every property is verified with Aadhar-based seller authentication",
  },
  {
    icon: MapPin,
    title: "Map Integration",
    description: "Explore properties with precise Google Maps location pins",
  },
  {
    icon: Users,
    title: "Trusted Agents",
    description: "Connect with verified agents for seamless transactions",
  },
  {
    icon: TrendingUp,
    title: "Market Analytics",
    description: "Real-time market insights and property price trends",
  },
  {
    icon: Building2,
    title: "Smart Dashboards",
    description: "Role-based dashboards for buyers, sellers, and agents",
  },
  {
    icon: FileCheck,
    title: "Secure Documents",
    description: "End-to-end encrypted document management system",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading mt-2">
            Everything You Need
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
