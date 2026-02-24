import { Building2 } from "lucide-react";
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
            <p className="text-sm opacity-60 leading-relaxed">
              India's most trusted real estate platform. Buy, sell, or rent properties with confidence.
            </p>
          </div>

          {[
            {
              title: "Quick Links",
              links: [
                { label: "Properties", to: "/properties" },
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
              ],
            },
            {
              title: "For Users",
              links: [
                { label: "Buyer Dashboard", to: "/dashboard" },
                { label: "Seller Dashboard", to: "/dashboard" },
                { label: "Agent Portal", to: "/agent-dashboard" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy Policy", to: "#" },
                { label: "Terms of Service", to: "#" },
                { label: "Cookie Policy", to: "#" },
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
