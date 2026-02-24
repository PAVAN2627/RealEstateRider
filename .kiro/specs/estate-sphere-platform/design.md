# Design Document: EstateSphere Platform

## Overview

EstateSphere is a cloud-based real estate management platform built with React/TypeScript frontend and Firebase backend services. The platform serves four distinct user roles (Buyer, Seller, Agent, Admin) with role-based access control, enabling property discovery, listing management, identity verification, and administrative oversight.

### Core Technologies

- **Frontend**: React 18+ with TypeScript, React Router for navigation
- **Authentication**: Firebase Authentication (email/password)
- **Database**: Cloud Firestore (NoSQL document database)
- **Storage**: Firebase Storage for images and documents
- **State Management**: React Context API with custom hooks
- **UI Framework**: Material-UI or Tailwind CSS for responsive design
- **Map Integration**: Google Maps JavaScript API or Mapbox
- **Build Tool**: Vite or Create React App

### Design Principles

1. **Role-Based Architecture**: All features and data access are governed by user roles
2. **Approval-First Model**: Users and properties require admin approval before full platform access
3. **Security by Default**: All sensitive operations require authentication and authorization checks
4. **Responsive Design**: Mobile-first approach ensuring usability across all device sizes
5. **Performance Optimization**: Lazy loading, caching, and optimistic UI updates
6. **Data Integrity**: Referential integrity maintained through cascading deletes and validation

## Architecture

### System Architecture

The platform follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Buyer UI   │  │  Seller UI   │  │   Agent UI   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────────────────────────┐    │
│  │   Admin UI   │  │   Shared Components & Layouts    │    │
│  └──────────────┘  └──────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              State Management (Context)              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │Property Svc  │  │ Inquiry Svc  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  User Svc    │  │ Storage Svc  │  │Notification  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Authorization & Role Guards                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Firebase   │  │  Firestore   │  │   Firebase   │      │
│  │     Auth     │  │   Database   │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User Registration:
1. User submits email, password, role → Firebase Auth creates account
2. User document created in Firestore with verificationStatus: "pending"
3. User prompted to upload Aadhar document → Stored in Firebase Storage
4. Admin reviews and approves/rejects → verificationStatus updated
5. Approved users can access role-specific features

User Login:
1. User submits credentials → Firebase Auth validates
2. Auth state listener retrieves user document from Firestore
3. Check verificationStatus (must be "approved")
4. Load user role and permissions into context
5. Redirect to role-specific dashboard
```

### Authorization Model

Role-based access control implemented through:
- **Route Guards**: Protect routes based on authentication and role
- **Component Guards**: Conditionally render UI elements based on permissions
- **Service Layer Checks**: Validate permissions before Firestore operations
- **Firestore Security Rules**: Server-side enforcement of access control

Permission Matrix:
```
Feature                  | Buyer | Seller | Agent | Admin
-------------------------|-------|--------|-------|-------
Browse Properties        |   ✓   |   ✓    |   ✓   |   ✓
Search/Filter            |   ✓   |   ✓    |   ✓   |   ✓
View Property Details    |   ✓   |   ✓    |   ✓   |   ✓
Wishlist Management      |   ✓   |   -    |   -   |   -
Send Inquiries           |   ✓   |   -    |   -   |   -
Create Listings          |   -   |   ✓    |   ✓   |   -
Manage Own Listings      |   -   |   ✓    |   ✓   |   -
View Received Inquiries  |   -   |   ✓    |   ✓   |   -
Professional Profile     |   -   |   -    |   ✓   |   -
Approve Users            |   -   |   -    |   -   |   ✓
Approve Properties       |   -   |   -    |   -   |   ✓
Manage All Users         |   -   |   -    |   -   |   ✓
Moderate Properties      |   -   |   -    |   -   |   ✓
View Activity Logs       |   -   |   -    |   -   |   ✓
```

## Components and Interfaces

### Frontend Component Architecture

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── AadharUpload.tsx
│   │   └── ProtectedRoute.tsx
│   ├── property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyList.tsx
│   │   ├── PropertyDetails.tsx
│   │   ├── PropertyForm.tsx
│   │   ├── PropertyGallery.tsx
│   │   ├── PropertyMap.tsx
│   │   └── PropertyFilters.tsx
│   ├── inquiry/
│   │   ├── InquiryForm.tsx
│   │   ├── InquiryList.tsx
│   │   └── InquiryCard.tsx
│   ├── dashboard/
│   │   ├── BuyerDashboard.tsx
│   │   ├── SellerDashboard.tsx
│   │   ├── AgentDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── AnalyticsCard.tsx
│   ├── admin/
│   │   ├── UserApprovalList.tsx
│   │   ├── PropertyApprovalList.tsx
│   │   ├── ActivityLog.tsx
│   │   └── UserManagement.tsx
│   ├── agent/
│   │   ├── AgentProfile.tsx
│   │   └── AgentProfileForm.tsx
│   ├── shared/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── ImageUpload.tsx
│   └── wishlist/
│       ├── WishlistButton.tsx
│       └── WishlistView.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── PropertiesPage.tsx
│   ├── PropertyDetailsPage.tsx
│   ├── DashboardPage.tsx
│   ├── WishlistPage.tsx
│   └── NotFoundPage.tsx
├── services/
│   ├── authService.ts
│   ├── userService.ts
│   ├── propertyService.ts
│   ├── inquiryService.ts
│   ├── storageService.ts
│   ├── notificationService.ts
│   └── activityLogService.ts
├── context/
│   ├── AuthContext.tsx
│   ├── PropertyContext.tsx
│   └── NotificationContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useProperties.ts
│   ├── useInquiries.ts
│   ├── useWishlist.ts
│   └── useNotifications.ts
├── types/
│   ├── user.types.ts
│   ├── property.types.ts
│   ├── inquiry.types.ts
│   └── notification.types.ts
├── utils/
│   ├── validation.ts
│   ├── formatters.ts
│   └── constants.ts
└── config/
    └── firebase.config.ts
```

### Key Component Interfaces

#### PropertyCard Component
```typescript
interface PropertyCardProps {
  property: Property;
  onWishlistToggle?: (propertyId: string) => void;
  isWishlisted?: boolean;
  showActions?: boolean;
}
```

#### PropertyFilters Component
```typescript
interface PropertyFiltersProps {
  onFilterChange: (filters: PropertyFilters) => void;
  initialFilters?: PropertyFilters;
}

interface PropertyFilters {
  priceMin?: number;
  priceMax?: number;
  propertyType?: PropertyType[];
  location?: string;
  availabilityStatus?: AvailabilityStatus[];
}
```

#### ProtectedRoute Component
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requireApproval?: boolean;
}
```

### Service Layer Interfaces

#### AuthService
```typescript
interface AuthService {
  register(email: string, password: string, role: UserRole): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updatePassword(newPassword: string): Promise<void>;
}
```

#### PropertyService
```typescript
interface PropertyService {
  createProperty(data: CreatePropertyData): Promise<Property>;
  updateProperty(id: string, data: Partial<Property>): Promise<void>;
  deleteProperty(id: string): Promise<void>;
  getProperty(id: string): Promise<Property>;
  getProperties(filters?: PropertyFilters): Promise<Property[]>;
  getUserProperties(userId: string): Promise<Property[]>;
  approveProperty(id: string, adminId: string): Promise<void>;
  rejectProperty(id: string, adminId: string, reason: string): Promise<void>;
}
```

#### InquiryService
```typescript
interface InquiryService {
  createInquiry(data: CreateInquiryData): Promise<Inquiry>;
  getInquiriesByBuyer(buyerId: string): Promise<Inquiry[]>;
  getInquiriesByAgent(agentId: string): Promise<Inquiry[]>;
  respondToInquiry(id: string, response: string): Promise<void>;
  updateInquiryStatus(id: string, status: InquiryStatus): Promise<void>;
}
```

#### StorageService
```typescript
interface StorageService {
  uploadPropertyImage(file: File, propertyId: string): Promise<string>;
  uploadAadharDocument(file: File, userId: string): Promise<string>;
  uploadAgentPhoto(file: File, agentId: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  validateFile(file: File, maxSize: number, allowedTypes: string[]): boolean;
}
```

## Data Models

### Firestore Collections Structure

#### users Collection
```typescript
interface User {
  uid: string;                    // Firebase Auth UID (document ID)
  email: string;
  role: 'buyer' | 'seller' | 'agent' | 'admin';
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  aadharDocumentUrl?: string;     // Firebase Storage URL
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  profile: {
    name: string;
    phone?: string;
  };
}
```

Indexes:
- `role` (ascending)
- `verificationStatus` (ascending)
- Composite: `role` + `verificationStatus`

#### agentProfiles Collection
```typescript
interface AgentProfile {
  id: string;                     // Document ID
  userId: string;                 // Reference to users collection
  name: string;
  phone: string;
  email: string;
  experience: string;             // e.g., "5 years"
  specialization: string;         // e.g., "Residential Properties"
  profilePhotoUrl?: string;
  verified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Indexes:
- `userId` (ascending)
- `verified` (ascending)

#### properties Collection
```typescript
interface Property {
  id: string;                     // Document ID
  title: string;
  description: string;
  price: number;
  propertyType: 'residential' | 'commercial' | 'land' | 'apartment';
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availabilityStatus: 'available' | 'sold' | 'under_offer';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  imageUrls: string[];            // Array of Firebase Storage URLs (max 10)
  ownershipDocumentUrls?: string[];
  ownerId: string;                // Reference to users collection
  ownerRole: 'seller' | 'agent';
  agentId?: string;               // Reference to agentProfiles if owner is agent
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy?: string;            // Admin user ID
  approvedAt?: Timestamp;
  rejectedReason?: string;
}
```

Indexes:
- `ownerId` (ascending)
- `verificationStatus` (ascending)
- `availabilityStatus` (ascending)
- `propertyType` (ascending)
- Composite: `verificationStatus` + `availabilityStatus`
- Composite: `verificationStatus` + `propertyType`
- Composite: `verificationStatus` + `price` (ascending)

#### inquiries Collection
```typescript
interface Inquiry {
  id: string;                     // Document ID
  propertyId: string;             // Reference to properties collection
  buyerId: string;                // Reference to users collection
  agentId: string;                // Reference to users/agentProfiles collection
  message: string;                // Max 1000 characters
  status: 'pending' | 'responded';
  response?: string;
  createdAt: Timestamp;
  respondedAt?: Timestamp;
}
```

Indexes:
- `buyerId` (ascending)
- `agentId` (ascending)
- `propertyId` (ascending)
- Composite: `agentId` + `status`
- Composite: `buyerId` + `createdAt` (descending)

#### wishlists Collection
```typescript
interface Wishlist {
  id: string;                     // Document ID (userId)
  userId: string;                 // Reference to users collection
  propertyIds: string[];          // Array of property IDs
  updatedAt: Timestamp;
}
```

Indexes:
- `userId` (ascending) - unique

#### notifications Collection
```typescript
interface Notification {
  id: string;                     // Document ID
  userId: string;                 // Reference to users collection
  message: string;
  type: 'inquiry_response' | 'property_approved' | 'property_rejected' | 
        'account_approved' | 'account_rejected' | 'new_inquiry';
  relatedEntityId?: string;       // Property ID, Inquiry ID, etc.
  read: boolean;
  createdAt: Timestamp;
}
```

Indexes:
- `userId` (ascending)
- Composite: `userId` + `read`
- Composite: `userId` + `createdAt` (descending)

#### activityLogs Collection
```typescript
interface ActivityLog {
  id: string;                     // Document ID
  userId: string;                 // Reference to users collection
  actionType: 'login' | 'logout' | 'property_created' | 'property_updated' | 
              'property_deleted' | 'inquiry_created' | 'inquiry_responded' |
              'user_approved' | 'user_rejected' | 'property_approved' | 
              'property_rejected';
  entityId?: string;              // Related entity ID (property, inquiry, etc.)
  metadata?: Record<string, any>; // Additional action-specific data
  timestamp: Timestamp;
}
```

Indexes:
- `userId` (ascending)
- `actionType` (ascending)
- Composite: `timestamp` (descending)
- Composite: `userId` + `timestamp` (descending)

### Firebase Storage Structure

```
storage/
├── aadhar-documents/
│   └── {userId}/
│       └── {filename}          // User Aadhar documents
├── property-images/
│   └── {propertyId}/
│       ├── {imageId}_1.jpg
│       ├── {imageId}_2.jpg
│       └── ...                 // Up to 10 images per property
├── ownership-documents/
│   └── {propertyId}/
│       └── {filename}          // Property ownership documents
└── agent-photos/
    └── {agentId}/
        └── profile.jpg         // Agent profile photos
```

Storage Security Rules:
- Aadhar documents: Read access only for admins
- Property images: Read access for all authenticated users, write for owners
- Ownership documents: Read access for admins and property owners
- Agent photos: Read access for all authenticated users, write for agent owner

### Data Relationships

```
User (1) ──────────── (0..n) Property
  │                              │
  │                              │
  │                         (0..n) Inquiry
  │                              │
  └──────────────────────────────┘
         (as Buyer)

User (Agent) (1) ──── (0..1) AgentProfile

User (1) ──────────── (0..1) Wishlist
                              │
                         (contains)
                              │
                         (0..n) Property

User (1) ──────────── (0..n) Notification

User (1) ──────────── (0..n) ActivityLog
```

### State Management Strategy

Using React Context API with custom hooks:

#### AuthContext
```typescript
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  isApproved: boolean;
}
```

#### PropertyContext
```typescript
interface PropertyContextValue {
  properties: Property[];
  loading: boolean;
  error: string | null;
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
  refreshProperties: () => Promise<void>;
}
```

#### NotificationContext
```typescript
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
```

### Routing Structure

```typescript
// Public Routes
/                           → HomePage
/login                      → LoginPage
/register                   → RegisterPage

// Protected Routes (Authenticated)
/dashboard                  → DashboardPage (role-specific)
/properties                 → PropertiesPage (browse/search)
/properties/:id             → PropertyDetailsPage

// Buyer Routes
/wishlist                   → WishlistPage
/my-inquiries               → InquiriesPage

// Seller/Agent Routes
/my-properties              → MyPropertiesPage
/properties/new             → CreatePropertyPage
/properties/:id/edit        → EditPropertyPage
/received-inquiries         → ReceivedInquiriesPage

// Agent Routes
/agent/profile              → AgentProfilePage
/agent/profile/edit         → EditAgentProfilePage

// Admin Routes
/admin/users                → UserManagementPage
/admin/properties           → PropertyModerationPage
/admin/activity             → ActivityLogPage
/admin/approvals/users      → UserApprovalsPage
/admin/approvals/properties → PropertyApprovalsPage
```

