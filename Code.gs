/**
 * Google Apps Script for RealEstateRider Email Service
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Copy this entire code
 * 4. Paste it into Code.gs
 * 5. Click "Deploy" > "New deployment"
 * 6. Select type: "Web app"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone"
 * 9. Click "Deploy"
 * 10. Copy the Web App URL
 * 11. Add it to your .env file as VITE_GOOGLE_SCRIPT_URL
 */

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.email || !data.subject) {
      throw new Error('Email and subject are required');
    }
    
    // Send email using MailApp
    MailApp.sendEmail({
      to: data.email,
      subject: data.subject,
      htmlBody: data.html || undefined,
      body: data.message || undefined,
      name: "RealEstateRider",
      noReply: true
    });
    
    // Log the email sent
    Logger.log('Email sent to: ' + data.email);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true,
        message: 'Email sent successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error
    Logger.log('Error: ' + error.toString());
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  // Test endpoint to verify the script is working
  return ContentService
    .createTextOutput("RealEstateRider Email Service is Active and Running!")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Test function to send a sample email (for debugging)
function testEmail() {
  const testData = {
    email: "your-email@example.com", // Replace with your email
    subject: "Test Email from RealEstateRider",
    html: "<h1>Test Email</h1><p>If you receive this, the email service is working!</p>"
  };
  
  MailApp.sendEmail({
    to: testData.email,
    subject: testData.subject,
    htmlBody: testData.html,
    name: "RealEstateRider"
  });
  
  Logger.log('Test email sent successfully');
}
