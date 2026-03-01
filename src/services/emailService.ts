/**
 * Email Service using Google Apps Script
 * Sends HTML emails via Google Script Web App
 */

// Import email templates
import { 
  getWelcomeEmailHTML, 
  getUserApprovalEmailHTML, 
  getUserRejectionEmailHTML,
  getPropertyApprovalEmailHTML,
  getPropertyRejectionEmailHTML,
  getInquiryReceivedEmailHTML,
  getInquiryResponseEmailHTML
} from './emailTemplates.js';

// Google Apps Script Web App URL from environment variables
const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string
): Promise<{ success: boolean }> => {
  try {
    const htmlMessage = getWelcomeEmailHTML(userName, userEmail);

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: "🏠 Welcome to RealEstateRider - Your Account is Ready!",
        html: htmlMessage,
      }),
    });

    console.log('✅ Welcome email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    return { success: false };
  }
};

/**
 * Send user approval notification email
 */
export const sendUserApprovalEmail = async (
  userEmail: string,
  userName: string,
  userRole: string
): Promise<{ success: boolean }> => {
  try {
    const htmlMessage = getUserApprovalEmailHTML(userName, userEmail, userRole);

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: "✅ Your RealEstateRider Account Has Been Approved!",
        html: htmlMessage,
      }),
    });

    console.log('✅ User approval email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send user approval email:", error);
    return { success: false };
  }
};

/**
 * Send user rejection notification email
 */
export const sendUserRejectionEmail = async (
  userEmail: string,
  userName: string,
  reason?: string
): Promise<{ success: boolean }> => {
  try {
    const htmlMessage = getUserRejectionEmailHTML(userName, userEmail, reason);

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: "❌ RealEstateRider Account Application Update",
        html: htmlMessage,
      }),
    });

    console.log('✅ User rejection email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send user rejection email:", error);
    return { success: false };
  }
};

/**
 * Send property approval notification email
 */
export const sendPropertyApprovalEmail = async (
  userEmail: string,
  userName: string,
  propertyTitle: string,
  propertyId: string
): Promise<{ success: boolean }> => {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://realestaterider.com';
    const propertyUrl = `${baseUrl}/properties/${propertyId}`;
    const htmlMessage = getPropertyApprovalEmailHTML(userName, propertyTitle, propertyUrl);

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: `✅ Your Property "${propertyTitle}" Has Been Approved!`,
        html: htmlMessage,
      }),
    });

    console.log('✅ Property approval email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send property approval email:", error);
    return { success: false };
  }
};

/**
 * Send property rejection notification email
 */
export const sendPropertyRejectionEmail = async (
  userEmail: string,
  userName: string,
  propertyTitle: string,
  reason?: string
): Promise<{ success: boolean }> => {
  try {
    const htmlMessage = getPropertyRejectionEmailHTML(userName, propertyTitle, reason);

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: `❌ Property "${propertyTitle}" Application Update`,
        html: htmlMessage,
      }),
    });

    console.log('✅ Property rejection email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send property rejection email:", error);
    return { success: false };
  }
};

/**
 * Send inquiry received notification to property owner
 */
export const sendInquiryReceivedEmail = async (
  ownerEmail: string,
  ownerName: string,
  propertyTitle: string,
  buyerName: string,
  buyerEmail: string,
  buyerPhone: string,
  message: string
): Promise<{ success: boolean }> => {
  try {
    const htmlMessage = getInquiryReceivedEmailHTML(
      ownerName,
      propertyTitle,
      buyerName,
      buyerEmail,
      buyerPhone,
      message
    );

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: ownerEmail,
        name: ownerName,
        subject: `🔔 New Inquiry for "${propertyTitle}"`,
        html: htmlMessage,
      }),
    });

    console.log('✅ Inquiry received email sent to:', ownerEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send inquiry received email:", error);
    return { success: false };
  }
};

/**
 * Send inquiry response notification to buyer
 */
export const sendInquiryResponseEmail = async (
  buyerEmail: string,
  buyerName: string,
  propertyTitle: string,
  sellerName: string,
  response: string
): Promise<{ success: boolean }> => {
  try {
    const htmlMessage = getInquiryResponseEmailHTML(
      buyerName,
      propertyTitle,
      sellerName,
      response
    );

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: buyerEmail,
        name: buyerName,
        subject: `💬 Response to Your Inquiry for "${propertyTitle}"`,
        html: htmlMessage,
      }),
    });

    console.log('✅ Inquiry response email sent to:', buyerEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send inquiry response email:", error);
    return { success: false };
  }
};
