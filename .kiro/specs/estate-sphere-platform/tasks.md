# Implementation Plan: EstateSphere Platform

## Overview

This implementation plan breaks down the EstateSphere platform into incremental coding tasks. The platform is built with React/TypeScript frontend and Firebase backend (Authentication, Firestore, Storage). Each task builds on previous work, with checkpoints to validate progress. The implementation follows a bottom-up approach: foundational setup → core services → UI components → feature integration → testing.

## Tasks

- [x] 1. Project setup and Firebase configuration
  - Initialize React/TypeScript project with Vite
  - Install dependencies: Firebase SDK, React Router, Material-UI/Tailwind CSS, Google Maps API
  - Create Firebase configuration file with environment variables
  - Initialize Firebase services (Auth, Firestore, Storage)
  - Set up project folder structure following the design architecture
  - _Requirements: 23.1, 23.4_

- [x] 2. Define TypeScript types and interfaces
  - [x] 2.1 Create user type definitions
    - Define User, UserRole, VerificationStatus types
    - Define AgentProfile interface
    - _Requirements: 1.1, 2.1, 10.1_
  
  - [x] 2.2 Create property type definitions
    - Define Property, PropertyType, AvailabilityStatus, PropertyFilters interfaces
    - Define location and coordinates types
    - _Requirements: 4.1, 4.2, 6.3, 6.4, 6.6_
  
  - [x] 2.3 Create inquiry and notification type definitions
    - Define Inquiry, InquiryStatus interfaces
    - Define Notification, NotificationType interfaces
    - Define ActivityLog interface
    - _Requirements: 9.1, 9.5, 15.1, 18.1_


- [x] 3. Implement authentication service layer
  - [x] 3.1 Create authService with Firebase Auth integration
    - Implement register function with email/password and role
    - Implement login function with credential validation
    - Implement logout function with session termination
    - Implement getCurrentUser function
    - Implement password update function
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 17.1_
  
  - [ ]* 3.2 Write unit tests for authService
    - Test successful registration flow
    - Test login with valid/invalid credentials
    - Test logout functionality
    - _Requirements: 1.2, 1.3_

- [x] 4. Implement user service layer
  - [x] 4.1 Create userService for Firestore user operations
    - Implement createUserDocument function
    - Implement getUserById function
    - Implement updateUserProfile function
    - Implement updateVerificationStatus function
    - Implement getUsersByRole function
    - _Requirements: 1.1, 3.6, 12.2, 12.3, 12.4_
  
  - [x] 4.2 Create agentProfileService for agent-specific operations
    - Implement createAgentProfile function
    - Implement updateAgentProfile function
    - Implement getAgentProfile function
    - _Requirements: 10.1, 10.2, 10.5_

- [x] 5. Implement storage service layer
  - [x] 5.1 Create storageService for Firebase Storage operations
    - Implement uploadPropertyImage function with validation
    - Implement uploadAadharDocument function with validation
    - Implement uploadAgentPhoto function with validation
    - Implement deleteFile function
    - Implement validateFile function (type, size checks)
    - _Requirements: 3.2, 3.3, 4.3, 4.4, 16.1, 16.2, 16.3, 16.5, 16.6_
  
  - [ ]* 5.2 Write unit tests for file validation
    - Test file type validation
    - Test file size validation
    - Test filename sanitization
    - _Requirements: 16.1, 16.2, 16.5_


- [x] 6. Implement property service layer
  - [x] 6.1 Create propertyService for property CRUD operations
    - Implement createProperty function with pending verification status
    - Implement updateProperty function with owner validation
    - Implement deleteProperty function with cascading deletes
    - Implement getProperty function
    - Implement getProperties function with filtering support
    - Implement getUserProperties function
    - _Requirements: 4.1, 4.2, 4.7, 5.1, 11.2, 11.3, 11.5_
  
  - [x] 6.2 Implement property approval functions
    - Implement approveProperty function (admin only)
    - Implement rejectProperty function with reason (admin only)
    - Record admin ID and timestamp for approval actions
    - _Requirements: 5.3, 5.4, 5.6, 13.3_
  
  - [x] 6.3 Implement property filtering logic
    - Implement filter by price range
    - Implement filter by property type
    - Implement filter by location (text search)
    - Implement filter by availability status
    - Support multiple simultaneous filters
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 7. Implement inquiry service layer
  - [x] 7.1 Create inquiryService for inquiry operations
    - Implement createInquiry function with validation
    - Implement getInquiriesByBuyer function
    - Implement getInquiriesByAgent function
    - Implement respondToInquiry function
    - Implement updateInquiryStatus function
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ]* 7.2 Write unit tests for inquiry validation
    - Test message length validation (max 1000 chars)
    - Test non-empty message validation
    - _Requirements: 9.2_

- [x] 8. Implement notification and activity logging services
  - [x] 8.1 Create notificationService
    - Implement createNotification function
    - Implement getUserNotifications function
    - Implement markAsRead function
    - Implement markAllAsRead function
    - Implement getUnreadCount function
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_
  
  - [x] 8.2 Create activityLogService
    - Implement logActivity function
    - Implement getActivityLogs function with filtering
    - Implement getUserActivityLogs function
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_


- [x] 9. Implement wishlist service layer
  - [x] 9.1 Create wishlistService
    - Implement addToWishlist function
    - Implement removeFromWishlist function
    - Implement getWishlist function
    - Implement isPropertyWishlisted function
    - Handle property deletion cascading
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10. Checkpoint - Ensure all service layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement AuthContext and authentication state management
  - [x] 11.1 Create AuthContext with provider
    - Implement user state management
    - Implement loading state for auth operations
    - Implement login, register, logout functions
    - Implement isAuthenticated computed property
    - Implement hasRole function for role checking
    - Implement isApproved computed property
    - Set up Firebase auth state listener
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 2.1, 17.1_
  
  - [x] 11.2 Create useAuth custom hook
    - Export AuthContext values through hook
    - _Requirements: 1.1, 2.1_

- [x] 12. Implement PropertyContext and property state management
  - [x] 12.1 Create PropertyContext with provider
    - Implement properties state array
    - Implement loading and error states
    - Implement filters state
    - Implement setFilters function
    - Implement refreshProperties function
    - _Requirements: 6.1, 6.2, 6.7_
  
  - [x] 12.2 Create useProperties custom hook
    - Export PropertyContext values through hook
    - _Requirements: 6.1_

- [x] 13. Implement NotificationContext and notification state management
  - [x] 13.1 Create NotificationContext with provider
    - Implement notifications state array
    - Implement unreadCount computed value
    - Implement markAsRead function
    - Implement markAllAsRead function
    - Set up real-time notification listener
    - _Requirements: 15.5, 15.6, 15.7_
  
  - [x] 13.2 Create useNotifications custom hook
    - Export NotificationContext values through hook
    - _Requirements: 15.5_


- [x] 14. Implement additional custom hooks
  - [x] 14.1 Create useInquiries hook
    - Implement fetching inquiries by buyer
    - Implement fetching inquiries by agent
    - Implement sending inquiry
    - Implement responding to inquiry
    - _Requirements: 9.3, 9.4, 9.6_
  
  - [x] 14.2 Create useWishlist hook
    - Implement fetching wishlist
    - Implement adding to wishlist
    - Implement removing from wishlist
    - Implement checking if property is wishlisted
    - _Requirements: 8.1, 8.2, 8.3, 8.6_

- [x] 15. Implement shared UI components
  - [x] 15.1 Create Header component
    - Display platform logo and navigation
    - Display user profile menu
    - Integrate NotificationBell component
    - Implement responsive hamburger menu for mobile
    - _Requirements: 19.6_
  
  - [x] 15.2 Create NotificationBell component
    - Display unread notification count badge
    - Display notification dropdown on click
    - Implement mark as read functionality
    - _Requirements: 15.5, 15.6_
  
  - [x] 15.3 Create ProtectedRoute component
    - Check authentication status
    - Check user role against allowed roles
    - Check approval status if required
    - Redirect to login or unauthorized page
    - _Requirements: 1.5, 2.1, 2.6_
  
  - [x] 15.4 Create LoadingSpinner and ErrorMessage components
    - Create reusable loading indicator
    - Create error display component with retry option
    - _Requirements: 21.1, 21.3, 22.6_
  
  - [x] 15.5 Create ImageUpload component
    - Implement file selection UI
    - Implement file validation (type, size)
    - Display upload progress
    - Display preview of uploaded images
    - Support multiple image uploads
    - _Requirements: 4.3, 4.4, 16.1, 16.2, 16.3_


- [x] 16. Implement authentication components
  - [x] 16.1 Create LoginForm component
    - Implement email and password input fields
    - Implement form validation
    - Implement login submission with error handling
    - Display loading state during authentication
    - _Requirements: 1.2, 1.3, 21.2, 21.4_
  
  - [x] 16.2 Create RegisterForm component
    - Implement email, password, and role selection fields
    - Implement form validation
    - Implement registration submission
    - Display success message and redirect to Aadhar upload
    - _Requirements: 1.1, 21.2_
  
  - [x] 16.3 Create AadharUpload component
    - Implement file upload for Aadhar document
    - Validate file type (image/PDF) and size (max 5MB)
    - Display upload progress and success confirmation
    - _Requirements: 3.1, 3.2, 3.3, 16.2_

- [x] 17. Implement property components
  - [x] 17.1 Create PropertyCard component
    - Display property thumbnail, title, price, type, location
    - Display wishlist button for buyers
    - Display verification status badge
    - Implement responsive card layout
    - _Requirements: 6.1, 8.6, 19.1, 19.7_
  
  - [x] 17.2 Create PropertyList component
    - Render grid of PropertyCard components
    - Implement pagination or infinite scroll
    - Display empty state when no properties found
    - _Requirements: 6.1, 22.4_
  
  - [x] 17.3 Create PropertyFilters component
    - Implement price range inputs (min/max)
    - Implement property type multi-select
    - Implement location text search
    - Implement availability status filter
    - Emit filter changes to parent component
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 17.4 Create PropertyGallery component
    - Display property images in carousel/gallery
    - Implement navigation controls (prev/next)
    - Implement fullscreen view
    - Implement lazy loading for images
    - _Requirements: 7.2, 22.4, 22.7_
  
  - [x] 17.5 Create PropertyMap component
    - Integrate Google Maps or Mapbox
    - Display property location marker
    - Implement zoom and pan controls
    - Handle missing coordinates gracefully
    - _Requirements: 7.3, 7.4, 7.5_
  
  - [x] 17.6 Create PropertyDetails component
    - Display all property information (title, description, price, type, location)
    - Integrate PropertyGallery component
    - Integrate PropertyMap component
    - Display agent/seller contact information
    - Display inquiry form for buyers
    - _Requirements: 7.1, 7.6, 7.7_


  - [x] 17.7 Create PropertyForm component
    - Implement form fields for title, description, price, type, location
    - Integrate ImageUpload component for property images (max 10)
    - Implement form validation
    - Support create and edit modes
    - Display ownership document upload option
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 11.2_

- [x] 18. Implement inquiry components
  - [x] 18.1 Create InquiryForm component
    - Implement message textarea with character counter
    - Validate message length (max 1000 chars)
    - Implement submission with loading state
    - Display success confirmation
    - _Requirements: 9.1, 9.2, 21.2_
  
  - [x] 18.2 Create InquiryCard component
    - Display inquiry message, property details, timestamp
    - Display inquiry status (pending/responded)
    - Display response if available
    - Show respond button for agents
    - _Requirements: 9.3, 9.4, 9.8_
  
  - [x] 18.3 Create InquiryList component
    - Render list of InquiryCard components
    - Filter by status
    - Sort by timestamp (most recent first)
    - _Requirements: 9.3, 9.4_

- [x] 19. Implement wishlist components
  - [x] 19.1 Create WishlistButton component
    - Display heart icon with filled/unfilled state
    - Toggle wishlist status on click
    - Show loading state during operation
    - _Requirements: 8.1, 8.2, 8.6_
  
  - [x] 19.2 Create WishlistView component
    - Display grid of wishlisted properties
    - Integrate PropertyCard components
    - Display empty state when wishlist is empty
    - _Requirements: 8.3_

- [x] 20. Checkpoint - Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 21. Implement agent-specific components
  - [x] 21.1 Create AgentProfile component
    - Display agent name, photo, phone, email, experience, specialization
    - Display verification badge if verified
    - _Requirements: 10.4, 10.6, 10.7_
  
  - [x] 21.2 Create AgentProfileForm component
    - Implement form fields for profile information
    - Integrate ImageUpload for profile photo
    - Implement form validation
    - _Requirements: 10.2, 10.3_

- [x] 22. Implement admin components
  - [x] 22.1 Create UserApprovalList component
    - Display list of pending users with role and registration date
    - Display Aadhar document viewer
    - Implement approve/reject buttons
    - _Requirements: 3.5, 12.1, 12.2, 12.3, 12.5_
  
  - [x] 22.2 Create PropertyApprovalList component
    - Display list of pending properties with details
    - Display property images and documents
    - Implement approve button
    - Implement reject button with reason input
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 13.5_
  
  - [x] 22.3 Create UserManagement component
    - Display all users with filters by role and status
    - Display user details (email, role, status, registration date, last login)
    - Implement suspend/delete user actions
    - _Requirements: 12.1, 12.4, 12.6, 12.7_
  
  - [x] 22.4 Create ActivityLog component
    - Display activity logs with user, action type, timestamp
    - Implement filters by user, action type, date range
    - Implement pagination
    - _Requirements: 18.6, 18.7_

- [x] 23. Implement dashboard components
  - [x] 23.1 Create AnalyticsCard component
    - Display metric title and value
    - Support optional trend indicator
    - Implement responsive card layout
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [x] 23.2 Create BuyerDashboard component
    - Display wishlist count and sent inquiries count
    - Display recent activity list (last 10 actions)
    - Display quick links to wishlist and properties
    - _Requirements: 14.1, 14.6_
  
  - [x] 23.3 Create SellerDashboard component
    - Display total listings, pending approvals, received inquiries counts
    - Display list of user's properties with inquiry counts
    - Display recent activity list
    - _Requirements: 14.2, 14.6, 11.6_
  
  - [x] 23.4 Create AgentDashboard component
    - Display managed properties, received inquiries, responded inquiries counts
    - Display list of properties with inquiry counts
    - Display recent inquiries
    - _Requirements: 14.3, 14.6, 11.6_
  
  - [x] 23.5 Create AdminDashboard component
    - Display total users, pending users, total properties, pending properties counts
    - Display recent activity logs
    - Display quick links to approval queues
    - _Requirements: 14.4, 14.5, 14.6_


- [x] 24. Implement page components
  - [x] 24.1 Create HomePage
    - Display hero section with platform introduction
    - Display featured properties
    - Display call-to-action buttons (login/register)
    - _Requirements: 19.1_
  
  - [x] 24.2 Create LoginPage and RegisterPage
    - Integrate LoginForm component
    - Integrate RegisterForm component
    - Implement responsive layout
    - _Requirements: 1.1, 1.2, 19.1_
  
  - [x] 24.3 Create PropertiesPage
    - Integrate PropertyFilters component
    - Integrate PropertyList component
    - Implement search functionality
    - Display loading and error states
    - _Requirements: 6.1, 6.2, 22.1, 22.3_
  
  - [x] 24.4 Create PropertyDetailsPage
    - Integrate PropertyDetails component
    - Fetch property by ID from route params
    - Handle property not found error
    - _Requirements: 7.1, 21.5_
  
  - [x] 24.5 Create DashboardPage
    - Route to role-specific dashboard component
    - Implement ProtectedRoute wrapper
    - _Requirements: 2.1, 14.1, 14.2, 14.3, 14.4_
  
  - [x] 24.6 Create WishlistPage
    - Integrate WishlistView component
    - Implement ProtectedRoute for buyer role only
    - _Requirements: 2.2, 8.3_
  
  - [x] 24.7 Create MyPropertiesPage (Seller/Agent)
    - Display user's properties with edit/delete actions
    - Display verification status for each property
    - Implement ProtectedRoute for seller/agent roles
    - _Requirements: 2.3, 2.4, 11.1, 11.7_
  
  - [x] 24.8 Create CreatePropertyPage and EditPropertyPage
    - Integrate PropertyForm component
    - Implement ProtectedRoute for seller/agent roles
    - Handle form submission and navigation
    - _Requirements: 4.1, 11.2_

- [x] 25. Implement routing and navigation
  - [x] 25.1 Set up React Router
    - Configure all routes (public and protected)
    - Implement route guards using ProtectedRoute
    - Implement 404 NotFoundPage
    - _Requirements: 2.1, 2.6, 21.4_
  
  - [x] 25.2 Implement navigation logic
    - Configure role-based redirects after login
    - Implement logout with redirect to home
    - Handle unauthorized access redirects
    - _Requirements: 1.5, 1.6, 2.6, 21.5_


- [x] 26. Implement notification triggers
  - [x] 26.1 Add notification creation to inquiry response
    - Trigger notification when agent responds to inquiry
    - _Requirements: 15.1, 9.7_
  
  - [x] 26.2 Add notification creation to property approval workflow
    - Trigger notification when admin approves property
    - Trigger notification when admin rejects property with reason
    - _Requirements: 15.2, 5.4, 13.6_
  
  - [x] 26.3 Add notification creation to inquiry creation
    - Trigger notification when buyer sends inquiry to agent
    - _Requirements: 15.3_
  
  - [x] 26.4 Add notification creation to user approval workflow
    - Trigger notification when admin approves user account
    - Trigger notification when admin rejects user account
    - _Requirements: 15.4_

- [x] 27. Implement activity logging integration
  - [x] 27.1 Add activity logging to authentication events
    - Log user login events
    - Log user logout events
    - _Requirements: 18.2_
  
  - [x] 27.2 Add activity logging to property operations
    - Log property creation events
    - Log property update events
    - Log property deletion events
    - _Requirements: 18.3_
  
  - [x] 27.3 Add activity logging to inquiry operations
    - Log inquiry creation events
    - Log inquiry response events
    - _Requirements: 18.4_
  
  - [x] 27.4 Add activity logging to admin actions
    - Log user approval/rejection events
    - Log property approval/rejection events
    - _Requirements: 18.5_

- [x] 28. Implement cascading delete operations
  - [x] 28.1 Add cascading deletes to user deletion
    - Delete all user's properties when user is deleted
    - Delete all user's inquiries when user is deleted
    - Delete user's wishlist when user is deleted
    - Delete user's notifications when user is deleted
    - _Requirements: 20.4_
  
  - [x] 28.2 Add cascading deletes to property deletion
    - Delete all property inquiries when property is deleted
    - Delete property from all wishlists when property is deleted
    - Delete property images from storage when property is deleted
    - _Requirements: 8.5, 11.5, 20.5_


- [x] 29. Implement Firestore security rules
  - [x] 29.1 Create security rules for users collection
    - Allow users to read their own document
    - Allow admins to read all user documents
    - Restrict write operations to authenticated users for their own document
    - _Requirements: 23.5, 23.6_
  
  - [x] 29.2 Create security rules for properties collection
    - Allow all authenticated users to read approved properties
    - Allow property owners to read/write their own properties
    - Allow admins to read/write all properties
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [x] 29.3 Create security rules for inquiries collection
    - Allow buyers to read their own inquiries
    - Allow agents to read inquiries addressed to them
    - Allow buyers to create inquiries
    - Allow agents to update inquiry responses
    - _Requirements: 9.3, 9.4, 9.6_
  
  - [x] 29.4 Create security rules for wishlists collection
    - Allow users to read/write only their own wishlist
    - _Requirements: 8.4_
  
  - [x] 29.5 Create security rules for notifications collection
    - Allow users to read only their own notifications
    - Allow users to update read status of their own notifications
    - _Requirements: 15.7_
  
  - [x] 29.6 Create security rules for activityLogs collection
    - Allow admins to read all activity logs
    - Restrict write operations to server-side only
    - _Requirements: 18.6_
  
  - [x] 29.7 Create security rules for agentProfiles collection
    - Allow all authenticated users to read verified agent profiles
    - Allow agents to read/write their own profile
    - Allow admins to read/write all profiles
    - _Requirements: 10.4, 10.7_

- [x] 30. Implement Firebase Storage security rules
  - [x] 30.1 Create storage rules for aadhar-documents
    - Restrict read access to admins only
    - Allow users to write their own Aadhar document
    - _Requirements: 3.4, 23.6_
  
  - [x] 30.2 Create storage rules for property-images
    - Allow all authenticated users to read property images
    - Allow property owners to write images for their properties
    - _Requirements: 4.5_
  
  - [x] 30.3 Create storage rules for ownership-documents
    - Allow admins and property owners to read ownership documents
    - Allow property owners to write ownership documents
    - _Requirements: 4.6_
  
  - [x] 30.4 Create storage rules for agent-photos
    - Allow all authenticated users to read agent photos
    - Allow agents to write their own profile photo
    - _Requirements: 10.3_


- [x] 31. Implement error handling and validation
  - [x] 31.1 Add comprehensive error handling to all services
    - Implement try-catch blocks with user-friendly error messages
    - Implement retry logic for failed database writes (max 3 retries)
    - Log errors with stack traces for debugging
    - _Requirements: 20.2, 21.1, 21.6, 21.7_
  
  - [x] 31.2 Add form validation to all input components
    - Validate required fields
    - Validate email format
    - Validate password strength
    - Validate numeric ranges (price, file size)
    - Display field-specific validation messages
    - _Requirements: 21.2, 20.7_
  
  - [x] 31.3 Add network error handling
    - Detect network failures
    - Display connection error messages
    - Implement retry suggestions
    - _Requirements: 21.3_
  
  - [x] 31.4 Add authentication and authorization error handling
    - Redirect to login on authentication errors
    - Display access denied messages for authorization errors
    - _Requirements: 21.4, 21.5_

- [x] 32. Implement performance optimizations
  - [x] 32.1 Add lazy loading for routes
    - Implement code splitting for page components
    - Use React.lazy and Suspense
    - _Requirements: 22.1_
  
  - [x] 32.2 Add image optimization
    - Implement lazy loading for property images
    - Compress images before upload
    - Use responsive image sizes
    - _Requirements: 22.4, 22.7_
  
  - [x] 32.3 Add data caching
    - Implement caching for frequently accessed data (user profile, properties)
    - Use React Query or SWR for data fetching and caching
    - _Requirements: 22.5_
  
  - [x] 32.4 Add loading indicators
    - Display loading spinners for async operations
    - Implement skeleton screens for content loading
    - _Requirements: 22.2, 22.6_


- [x] 33. Implement responsive design
  - [x] 33.1 Add responsive breakpoints to all components
    - Implement mobile layout (< 768px)
    - Implement tablet layout (768px - 1024px)
    - Implement desktop layout (> 1024px)
    - _Requirements: 19.1, 19.2, 19.3, 19.4_
  
  - [x] 33.2 Ensure touch-friendly UI on mobile
    - Set minimum touch target size to 44x44 pixels
    - Test all interactive elements on mobile devices
    - _Requirements: 19.5_
  
  - [x] 33.3 Implement responsive navigation
    - Create hamburger menu for mobile devices
    - Ensure navigation is accessible on all screen sizes
    - _Requirements: 19.6_
  
  - [x] 33.4 Ensure responsive images
    - Use CSS to scale images proportionally
    - Prevent image distortion across device sizes
    - _Requirements: 19.7_

- [x] 34. Implement security measures
  - [x] 34.1 Add HTTPS enforcement
    - Configure HTTPS for all data transmissions
    - _Requirements: 23.1_
  
  - [x] 34.2 Add input sanitization
    - Sanitize all user inputs to prevent injection attacks
    - Validate data types before database operations
    - _Requirements: 23.3, 20.7_
  
  - [x] 34.3 Add CORS configuration
    - Configure CORS policies for Firebase
    - Restrict API access to authorized domains
    - _Requirements: 23.4_
  
  - [x] 34.4 Add rate limiting for authentication
    - Implement rate limiting on login endpoint
    - Prevent brute force attacks
    - _Requirements: 23.7_
  
  - [x] 34.5 Ensure data privacy
    - Hide user email addresses from other users (except agents handling inquiries)
    - Restrict Aadhar document access to admins only
    - _Requirements: 23.5, 23.6_

- [x] 35. Checkpoint - Ensure all integration tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 36. Implement session management
  - [x] 36.1 Configure Firebase Auth session persistence
    - Set session expiration to 24 hours
    - Implement session validation on protected requests
    - _Requirements: 17.1, 17.2, 17.5_
  
  - [x] 36.2 Add session termination on security events
    - Terminate sessions on password change
    - Terminate sessions on account suspension
    - _Requirements: 17.3, 17.4_
  
  - [x] 36.3 Add session token validation
    - Validate session tokens on every protected API request
    - Return authentication error for invalid/expired tokens
    - _Requirements: 17.5, 17.6_

- [x] 37. Create Firestore indexes
  - [x] 37.1 Create indexes for users collection
    - Create index on role field
    - Create index on verificationStatus field
    - Create composite index on role + verificationStatus
    - _Requirements: 12.1_
  
  - [x] 37.2 Create indexes for properties collection
    - Create index on ownerId field
    - Create index on verificationStatus field
    - Create index on availabilityStatus field
    - Create index on propertyType field
    - Create composite indexes for filtering combinations
    - _Requirements: 6.1, 6.7, 11.1_
  
  - [x] 37.3 Create indexes for inquiries collection
    - Create index on buyerId field
    - Create index on agentId field
    - Create index on propertyId field
    - Create composite index on agentId + status
    - Create composite index on buyerId + createdAt (descending)
    - _Requirements: 9.3, 9.4_
  
  - [x] 37.4 Create indexes for notifications collection
    - Create index on userId field
    - Create composite index on userId + read
    - Create composite index on userId + createdAt (descending)
    - _Requirements: 15.5, 15.7_
  
  - [x] 37.5 Create indexes for activityLogs collection
    - Create index on userId field
    - Create index on actionType field
    - Create composite index on timestamp (descending)
    - Create composite index on userId + timestamp (descending)
    - _Requirements: 18.6, 18.7_


- [x] 38. Implement data integrity checks
  - [x] 38.1 Add referential integrity validation
    - Validate user references in properties and inquiries
    - Validate property references in inquiries and wishlists
    - _Requirements: 20.3_
  
  - [x] 38.2 Add unique constraint enforcement
    - Enforce unique email addresses in user registration
    - Handle duplicate email errors gracefully
    - _Requirements: 20.6_
  
  - [x] 38.3 Add data type validation
    - Validate all data types before database writes
    - Validate required fields are non-empty
    - _Requirements: 20.7_
  
  - [x] 38.4 Add transaction support for critical operations
    - Use Firestore transactions for cascading deletes
    - Ensure atomicity for multi-document operations
    - _Requirements: 20.1, 20.4, 20.5_

- [x] 39. Final integration and testing
  - [x] 39.1 Test complete user registration and approval flow
    - Register as each role (buyer, seller, agent)
    - Upload Aadhar document
    - Admin approves/rejects users
    - Verify login access based on approval status
    - _Requirements: 1.1, 1.2, 1.5, 3.1, 3.6, 12.2, 12.3_
  
  - [x] 39.2 Test complete property listing and approval flow
    - Create property as seller/agent
    - Upload property images
    - Admin approves/rejects property
    - Verify property visibility to buyers
    - _Requirements: 4.1, 4.3, 5.1, 5.3, 5.4, 6.1_
  
  - [x] 39.3 Test inquiry and notification flow
    - Buyer sends inquiry on property
    - Agent receives notification
    - Agent responds to inquiry
    - Buyer receives notification
    - _Requirements: 9.1, 9.6, 9.7, 15.1, 15.3_
  
  - [x] 39.4 Test wishlist functionality
    - Buyer adds properties to wishlist
    - Buyer removes properties from wishlist
    - Verify wishlist persistence
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 39.5 Test property search and filtering
    - Apply multiple filters simultaneously
    - Verify filter results accuracy
    - Test search performance
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 22.3_
  
  - [x] 39.6 Test role-based access control
    - Verify each role can only access authorized features
    - Test unauthorized access attempts
    - Verify route protection
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 39.7 Test admin dashboard and moderation
    - View pending users and properties
    - Approve/reject users and properties
    - View activity logs with filters
    - Test user management actions (suspend, delete)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.7, 13.1, 13.2, 13.3, 18.6, 18.7_
  
  - [x] 39.8 Test responsive design across devices
    - Test on mobile devices (< 768px)
    - Test on tablets (768px - 1024px)
    - Test on desktop (> 1024px)
    - Verify touch targets on mobile
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_
  
  - [x] 39.9 Test error handling and edge cases
    - Test invalid login credentials
    - Test file upload validation errors
    - Test network failure scenarios
    - Test unauthorized access attempts
    - Test form validation errors
    - _Requirements: 1.3, 16.2, 21.1, 21.2, 21.3, 21.4, 21.5_
  
  - [ ]* 39.10 Test performance benchmarks
    - Measure page load times (target < 2 seconds)
    - Measure form submission response times (target < 1 second)
    - Measure search response times (target < 2 seconds)
    - _Requirements: 22.1, 22.2, 22.3_

- [x] 40. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The implementation uses TypeScript throughout for type safety
- Firebase services (Auth, Firestore, Storage) handle backend operations
- React Context API manages global state without additional libraries
- Material-UI or Tailwind CSS provides responsive UI components
- All security rules must be deployed before production use
- Performance optimizations should be implemented progressively
- Testing tasks validate critical user flows and edge cases
