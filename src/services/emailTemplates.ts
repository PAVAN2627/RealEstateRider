/**
 * Email HTML Templates for RealEstateRider
 */

// Get the base URL for links in emails
const getBaseUrl = () => {
  return 'https://real-estate-rider.vercel.app';
};

const getEmailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>© 2024 RealEstateRider. All rights reserved.</p>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Welcome email template
 */
export const getWelcomeEmailHTML = (userName: string, userEmail: string): string => {
  const baseUrl = getBaseUrl();
  const content = `
    <div class="header">
      <h1>🏠 Welcome to RealEstateRider!</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName}!</h2>
      <p>Thank you for joining RealEstateRider, your trusted platform for real estate transactions.</p>
      
      <div class="info-box">
        <strong>Your Account Details:</strong><br>
        Email: ${userEmail}
      </div>
      
      <p>You can now:</p>
      <ul>
        <li>Browse thousands of properties</li>
        <li>List your properties for sale</li>
        <li>Connect with verified buyers and sellers</li>
        <li>Get real-time updates on inquiries</li>
      </ul>
      
      <a href="${baseUrl}/dashboard" class="button">Go to Dashboard</a>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      
      <p>Best regards,<br>The RealEstateRider Team</p>
    </div>
  `;
  return getEmailWrapper(content);
};

/**
 * User approval email template
 */
export const getUserApprovalEmailHTML = (
  userName: string,
  userEmail: string,
  userRole: string
): string => {
  const baseUrl = getBaseUrl();
  const content = `
    <div class="header">
      <h1>✅ Account Approved!</h1>
    </div>
    <div class="content">
      <h2>Congratulations ${userName}!</h2>
      <p>Your RealEstateRider account has been approved by our admin team.</p>
      
      <div class="info-box">
        <strong>Account Status:</strong> Approved ✅<br>
        <strong>Role:</strong> ${userRole}<br>
        <strong>Email:</strong> ${userEmail}
      </div>
      
      <p>You now have full access to all platform features:</p>
      <ul>
        ${userRole === 'seller' || userRole === 'agent' ? '<li>List and manage properties</li>' : ''}
        ${userRole === 'seller' || userRole === 'agent' ? '<li>Respond to buyer inquiries</li>' : ''}
        ${userRole === 'buyer' ? '<li>Browse and search properties</li>' : ''}
        ${userRole === 'buyer' ? '<li>Send inquiries to sellers</li>' : ''}
        <li>Access your personalized dashboard</li>
        <li>Manage your profile</li>
      </ul>
      
      <a href="${baseUrl}/login" class="button">Login Now</a>
      
      <p>Welcome aboard!</p>
      
      <p>Best regards,<br>The RealEstateRider Team</p>
    </div>
  `;
  return getEmailWrapper(content);
};

/**
 * User rejection email template
 */
export const getUserRejectionEmailHTML = (
  userName: string,
  userEmail: string,
  reason?: string
): string => {
  const content = `
    <div class="header">
      <h1>❌ Account Application Update</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName},</h2>
      <p>Thank you for your interest in RealEstateRider.</p>
      
      <p>Unfortunately, we are unable to approve your account at this time.</p>
      
      ${reason ? `
      <div class="info-box">
        <strong>Reason:</strong><br>
        ${reason}
      </div>
      ` : ''}
      
      <p>If you believe this is an error or would like to reapply, please contact our support team at support@realestaterider.com</p>
      
      <p>Best regards,<br>The RealEstateRider Team</p>
    </div>
  `;
  return getEmailWrapper(content);
};

/**
 * Property approval email template
 */
export const getPropertyApprovalEmailHTML = (
  userName: string,
  propertyTitle: string,
  propertyUrl: string
): string => {
  const content = `
    <div class="header">
      <h1>✅ Property Approved!</h1>
    </div>
    <div class="content">
      <h2>Great News ${userName}!</h2>
      <p>Your property listing has been approved and is now live on RealEstateRider.</p>
      
      <div class="info-box">
        <strong>Property:</strong> ${propertyTitle}<br>
        <strong>Status:</strong> Live and Visible to Buyers ✅
      </div>
      
      <p>Your property is now:</p>
      <ul>
        <li>Visible to all buyers on the platform</li>
        <li>Searchable in property listings</li>
        <li>Ready to receive inquiries</li>
      </ul>
      
      <a href="${propertyUrl}" class="button">View Your Property</a>
      
      <p>Good luck with your sale!</p>
      
      <p>Best regards,<br>The RealEstateRider Team</p>
    </div>
  `;
  return getEmailWrapper(content);
};

/**
 * Property rejection email template
 */
export const getPropertyRejectionEmailHTML = (
  userName: string,
  propertyTitle: string,
  reason?: string
): string => {
  const baseUrl = getBaseUrl();
  const content = `
    <div class="header">
      <h1>❌ Property Listing Update</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName},</h2>
      <p>Thank you for submitting your property listing.</p>
      
      <p>Unfortunately, we are unable to approve the following property at this time:</p>
      
      <div class="info-box">
        <strong>Property:</strong> ${propertyTitle}
      </div>
      
      ${reason ? `
      <div class="info-box">
        <strong>Reason:</strong><br>
        ${reason}
      </div>
      ` : ''}
      
      <p>You can edit your property listing and resubmit it for approval. Please ensure:</p>
      <ul>
        <li>All required fields are filled correctly</li>
        <li>Property images are clear and relevant</li>
        <li>Ownership documents are valid</li>
        <li>Property details are accurate</li>
      </ul>
      
      <a href="${baseUrl}/my-properties" class="button">Edit Property</a>
      
      <p>If you have questions, please contact our support team.</p>
      
      <p>Best regards,<br>The RealEstateRider Team</p>
    </div>
  `;
  return getEmailWrapper(content);
};

/**
 * Inquiry received email template (for property owner)
 */
export const getInquiryReceivedEmailHTML = (
  ownerName: string,
  propertyTitle: string,
  buyerName: string,
  buyerEmail: string,
  buyerPhone: string,
  message: string
): string => {
  const baseUrl = getBaseUrl();
  const content = `
    <div class="header">
      <h1>🔔 New Inquiry Received!</h1>
    </div>
    <div class="content">
      <h2>Hello ${ownerName},</h2>
      <p>You have received a new inquiry for your property:</p>
      
      <div class="info-box">
        <strong>Property:</strong> ${propertyTitle}
      </div>
      
      <h3>Buyer Details:</h3>
      <div class="info-box">
        <strong>Name:</strong> ${buyerName}<br>
        <strong>Email:</strong> ${buyerEmail}<br>
        <strong>Phone:</strong> ${buyerPhone}
      </div>
      
      <h3>Message:</h3>
      <div class="info-box">
        ${message}
      </div>
      
      <p>Please respond to this inquiry as soon as possible to maintain buyer interest.</p>
      
      <a href="${baseUrl}/received-inquiries" class="button">View & Respond</a>
      
      <p>Best regards,<br>The RealEstateRider Team</p>
    </div>
  `;
  return getEmailWrapper(content);
};

/**
 * Inquiry response email template (for buyer)
 */
export const getInquiryResponseEmailHTML = (
  buyerName: string,
  propertyTitle: string,
  sellerName: string,
  response: string
): string => {
  const baseUrl = getBaseUrl();
  const content = `
    <div class="header">
      <h1>💬 Response to Your Inquiry</h1>
    </div>
    <div class="content">
      <h2>Hello ${buyerName},</h2>
      <p>You have received a response to your inquiry:</p>
      
      <div class="info-box">
        <strong>Property:</strong> ${propertyTitle}<br>
        <strong>From:</strong> ${sellerName}
      </div>
      
      <h3>Response:</h3>
      <div class="info-box">
        ${response}
      </div>
      
      <p>You can continue the conversation through our platform.</p>
      
      <a href="${baseUrl}/my-inquiries" class="button">View Conversation</a>
      
      <p>Best regards,<br>The RealEstateRider Team</p>
    </div>
  `;
  return getEmailWrapper(content);
};
