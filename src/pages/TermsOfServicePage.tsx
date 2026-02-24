import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold font-heading">Terms of Service</h1>
        </div>
        
        <p className="text-muted-foreground mb-8">Last updated: February 24, 2026</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using RealEstateRider, you accept and agree to be bound by the terms and provisions 
              of this agreement. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To use certain features of our platform, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your information to keep it accurate and current</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Roles and Verification</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Our platform supports three user roles:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Buyers:</strong> Can browse properties, save to wishlist, and send inquiries</li>
              <li><strong>Sellers:</strong> Can list properties for sale and manage inquiries</li>
              <li><strong>Agents:</strong> Must provide identity verification (Aadhar card) and await admin approval before listing properties</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              All users must provide valid identification documents as required. We reserve the right to verify 
              any information provided and reject or suspend accounts that fail verification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Property Listings</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              When listing a property, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Provide accurate and truthful information about the property</li>
              <li>Upload genuine images and documents</li>
              <li>Have legal authority to list the property</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Update listing status promptly when property is sold or unavailable</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              All property listings are subject to admin approval. We reserve the right to reject or remove 
              any listing that violates these terms or applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Post false, misleading, or fraudulent property listings</li>
              <li>Impersonate another person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated systems to access the platform</li>
              <li>Collect user information without consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The platform and its original content, features, and functionality are owned by RealEstateRider 
              and are protected by international copyright, trademark, and other intellectual property laws. 
              You retain ownership of content you upload but grant us a license to use it for platform operations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The platform is provided "as is" and "as available" without warranties of any kind. We do not 
              guarantee the accuracy, completeness, or reliability of property listings. Users are responsible 
              for conducting their own due diligence before any property transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              RealEstateRider shall not be liable for any indirect, incidental, special, consequential, or 
              punitive damages resulting from your use of the platform. We are not responsible for disputes 
              between users or the outcome of property transactions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for any breach of 
              these Terms. Upon termination, your right to use the platform will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material 
              changes by posting the new Terms on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India, without 
              regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at:
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

export default TermsOfServicePage;
