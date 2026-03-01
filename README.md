# RealEstateRider

A modern real estate management platform built with React, TypeScript, and Firebase.

## Features

- **Multi-Role System**: Buyers, Sellers, Agents, and Admin
- **Property Management**: Create, edit, and browse property listings
- **Smart Search**: Filter by type, price, location with Google Maps integration
- **Inquiry System**: WhatsApp-style chat between buyers and sellers
- **Admin Dashboard**: Approve users and properties with document verification
- **Email Notifications**: Automated emails for approvals and inquiries
- **AI Chatbot**: Gemini-powered assistant for platform help
- **Wishlist**: Save favorite properties

## Tech Stack

- React 18 + TypeScript + Vite
- Firebase (Auth, Firestore)
- Tailwind CSS + shadcn/ui
- Google Maps API
- Gemini AI
- Google Apps Script (Email)

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

## Environment Setup

Required API keys in `.env`:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Google Services
VITE_GOOGLE_MAPS_API_KEY=
VITE_GEMINI_API_KEY=
VITE_GOOGLE_SCRIPT_URL=

# Admin
VITE_ADMIN_SECRET_KEY=
```

### Get API Keys

1. **Firebase**: [console.firebase.google.com](https://console.firebase.google.com/)
2. **Google Maps**: [console.cloud.google.com](https://console.cloud.google.com/)
3. **Gemini AI**: [makersuite.google.com](https://makersuite.google.com/app/apikey)
4. **Email Service**: Deploy `Code.gs` to [script.google.com](https://script.google.com/)

### Firebase Setup (Important!)

After creating your Firebase project, you MUST add your domain to authorized domains:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your domains:
   - `localhost` (for development)
   - `your-app.vercel.app` (for production)
   - Any custom domains

**Without this, Google Sign-In will fail with popup errors!**

## Email Service Setup

1. Open [Google Apps Script](https://script.google.com/)
2. Create new project
3. Copy code from `Code.gs`
4. Deploy as Web App (Anyone can access)
5. Copy URL to `VITE_GOOGLE_SCRIPT_URL`

## User Roles

### Buyer
- Browse and search properties
- Save to wishlist
- Send inquiries

### Seller/Agent
- List properties with images
- Manage listings
- Respond to inquiries
- Requires admin approval

### Admin
- Approve/reject users
- Approve/reject properties
- View activity logs

## Project Structure

```
src/
├── components/     # React components
├── services/       # API services
├── context/        # React context
├── hooks/          # Custom hooks
├── pages/          # Page components
└── types/          # TypeScript types
```

## Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # Run linter
```

## License

Private and Proprietary

---

Built with React, TypeScript, and Firebase
