import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Cookie } from "lucide-react";

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
            <Cookie className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold font-heading">Cookie Policy</h1>
        </div>
        
        <p className="text-muted-foreground mb-8">Last updated: February 24, 2026</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our platform. They help us 
              provide you with a better experience by remembering your preferences and understanding how you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Essential Cookies:</strong> Required for the platform to function properly (authentication, security)</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
              <li><strong>Performance Cookies:</strong> Improve platform performance and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Session Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Temporary cookies that expire when you close your browser. Used for authentication and navigation.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Persistent Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Remain on your device for a set period. Used to remember your login status and preferences.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Third-Party Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Set by third-party services we use, such as:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                  <li>Firebase Authentication (Google)</li>
                  <li>Google Maps for location services</li>
                  <li>Analytics services to understand user behavior</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Browser Settings: Most browsers allow you to refuse or delete cookies</li>
              <li>Third-Party Tools: Use privacy tools to manage tracking cookies</li>
              <li>Opt-Out: You can opt-out of analytics cookies through our settings</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Please note that disabling essential cookies may affect the functionality of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Browser-Specific Instructions</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To manage cookies in your browser:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. 
              We will notify you of any material changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div className="mt-3 text-muted-foreground">
              <p>Email: support@realestaterider.com</p>
              <p>Phone: +91 1800-123-4567</p>
              <p>Address: Mumbai, Maharashtra, India</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicyPage;
