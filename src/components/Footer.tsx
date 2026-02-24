import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">
                RealEstate<span className="text-accent">Rider</span>
              </span>
            </div>
            <p className="text-sm opacity-60 leading-relaxed mb-4">
              India's most trusted real estate platform. Buy, sell, or rent properties with confidence.
            </p>
            <div className="space-y-2 text-sm opacity-60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@realestaterider.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {[
            {
              title: "Quick Links",
              links: [
                { label: "Browse Properties", to: "/properties" },
                { label: "About Us", to: "/about" },
                { label: "Contact Us", to: "/contact" },
                { label: "FAQs", to: "/faqs" },
              ],
            },
            {
              title: "For Users",
              links: [
                { label: "Login", to: "/login" },
                { label: "Register", to: "/register" },
                { label: "Buyer Dashboard", to: "/dashboard" },
                { label: "Post Property", to: "/properties/new" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy Policy", to: "/privacy-policy" },
                { label: "Terms of Service", to: "/terms-of-service" },
                { label: "Cookie Policy", to: "/cookie-policy" },
                { label: "Refund Policy", to: "/refund-policy" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-heading font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 mt-12 pt-6 text-center text-sm opacity-40">
          © 2026 RealEstateRider. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
