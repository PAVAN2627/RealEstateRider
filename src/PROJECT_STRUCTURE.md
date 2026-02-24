# EstateSphere Project Structure

This document describes the folder structure and organization of the EstateSphere platform.

## Directory Structure

```
src/
├── assets/              # Static assets (images, icons, etc.)
├── components/          # React components
│   ├── auth/           # Authentication components (LoginForm, RegisterForm, etc.)
│   ├── property/       # Property-related components (PropertyCard, PropertyList, etc.)
│   ├── inquiry/        # Inquiry components
│   ├── dashboard/      # Dashboard components for each role
│   ├── admin/          # Admin-specific components
│   ├── agent/          # Agent-specific components
│   ├── wishlist/       # Wishlist components
│   ├── shared/         # Shared/common components (Header, Footer, etc.)
│   └── ui/             # UI library components (shadcn/ui)
├── config/             # Configuration files
│   └── firebase.config.ts  # Firebase initialization and service exports
├── context/            # React Context providers for state management
│   ├── AuthContext.tsx
│   ├── PropertyContext.tsx
│   └── NotificationContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useProperties.ts
│   ├── useInquiries.ts
│   ├── useWishlist.ts
│   └── useNotifications.ts
├── pages/              # Page components (route components)
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── PropertiesPage.tsx
│   ├── PropertyDetailsPage.tsx
│   ├── DashboardPage.tsx
│   └── WishlistPage.tsx
├── services/           # Service layer for Firebase operations
│   ├── authService.ts
│   ├── userService.ts
│   ├── propertyService.ts
│   ├── inquiryService.ts
│   ├── storageService.ts
│   ├── notificationService.ts
│   └── activityLogService.ts
├── types/              # TypeScript type definitions
│   ├── user.types.ts
│   ├── property.types.ts
│   ├── inquiry.types.ts
│   └── notification.types.ts
├── utils/              # Utility functions and constants
│   ├── validation.ts
│   ├── formatters.ts
│   └── constants.ts
└── test/               # Test files
    └── setup.ts
```

## Key Technologies

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **UI Library**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **Backend Services**: Firebase (Auth, Firestore, Storage)
- **Maps**: Google Maps JavaScript API
- **Form Handling**: React Hook Form + Zod validation
- **Testing**: Vitest + Testing Library

## Firebase Services

The platform uses three Firebase services:

1. **Firebase Authentication**: User authentication with email/password
2. **Cloud Firestore**: NoSQL database for storing users, properties, inquiries, etc.
3. **Firebase Storage**: File storage for images and documents

All Firebase services are initialized in `src/config/firebase.config.ts` and exported for use throughout the application.

## Environment Variables

Required environment variables (stored in `.env`):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_GOOGLE_MAPS_API_KEY=
```

## Architecture Principles

1. **Separation of Concerns**: Services handle data operations, components handle UI
2. **Type Safety**: TypeScript types defined in dedicated files
3. **Reusability**: Shared components and hooks for common functionality
4. **Role-Based Access**: All features governed by user roles (Buyer, Seller, Agent, Admin)
5. **Security First**: Authentication and authorization checks at multiple layers
