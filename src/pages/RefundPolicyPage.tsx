import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RefreshCw } from "lucide-react";

const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold font-heading">Refund Policy</h1>
        </div>
        
        <p className="text-muted-foreground mb-8">Last updated: February 24, 2026</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              RealEstateRider is a free platform connecting buyers, sellers, and agents for property transactions. 
              As we do not charge fees for basic platform usage, this refund policy primarily applies to any 
              premium services or features that may be introduced in the future.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Free Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The following services are provided free of charge and do not involve refunds:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>User registration and account creation</li>
              <li>Property listing and browsing</li>
              <li>Sending and receiving inquiries</li>
              <li>Wishlist management</li>
              <li>Basic property search and filtering</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Premium Services (If Applicable)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you purchase any premium services in the future, the following refund conditions will apply:
            </p>
            
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">3.1 Eligibility for Refunds</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Refunds may be requested within 7 days of purchase if:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                  <li>The service was not delivered as described</li>
                  <li>Technical issues prevented service usage</li>
                  <li>Duplicate charges occurred</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">3.2 Non-Refundable Items</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The following are not eligible for refunds:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                  <li>Services already fully utilized</li>
                  <li>Promotional or discounted services (unless legally required)</li>
                  <li>Services purchased more than 7 days ago</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Property Transactions</h2>
            <p className="text-muted-foreground leading-relaxed">
              RealEstateRider is a platform that facilitates connections between buyers, sellers, and agents. 
              We are not party to any property transactions and do not handle payments for properties. 
              Any disputes regarding property transactions must be resolved directly between the parties involved.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you believe you are eligible for a refund, please contact us with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Your account email address</li>
              <li>Transaction ID or receipt</li>
              <li>Reason for refund request</li>
              <li>Supporting documentation (if applicable)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We will review your request within 5-7 business days and notify you of the outcome.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Refund Processing</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If your refund is approved:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Refunds will be processed to the original payment method</li>
              <li>Processing time: 7-14 business days</li>
              <li>You will receive an email confirmation once processed</li>
              <li>Bank processing times may vary</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cancellation Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may cancel your account at any time. Upon cancellation:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
              <li>Your property listings will be removed</li>
              <li>Your personal data will be handled according to our Privacy Policy</li>
              <li>No refunds will be issued for unused portions of any paid services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Disputes</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have a dispute regarding a refund decision, you may escalate it by contacting our support team. 
              We will make every effort to resolve disputes fairly and promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately 
              upon posting to this page. Your continued use of the platform after changes constitutes acceptance 
              of the modified policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For refund requests or questions about this policy, please contact us at:
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

export default RefundPolicyPage;
