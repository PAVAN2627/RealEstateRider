import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { PropertyProvider } from "./context/PropertyContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { UserRole } from "./types/user.types";
import LoadingSpinner from "./components/shared/LoadingSpinner";

// Public Pages - Eager loaded for faster initial load
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AadharUploadPage from "./pages/AadharUploadPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";

// Protected Pages - Lazy loaded for code splitting
// Requirement 22.1: Implement code splitting for page components
const PropertiesPage = lazy(() => import("./pages/PropertiesPage"));
const PropertiesMapPage = lazy(() => import("./pages/PropertiesMapPage"));
const PropertyDetailsPage = lazy(() => import("./pages/PropertyDetailsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const MyInquiriesPage = lazy(() => import("./pages/MyInquiriesPage"));
const ReceivedInquiriesPage = lazy(() => import("./pages/ReceivedInquiriesPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const MyPropertiesPage = lazy(() => import("./pages/MyPropertiesPage"));
const CreatePropertyPage = lazy(() => import("./pages/CreatePropertyPage"));
const EditPropertyPage = lazy(() => import("./pages/EditPropertyPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserApprovalsPage = lazy(() => import("./pages/admin/UserApprovalsPage"));
const PropertyApprovalsPage = lazy(() => import("./pages/admin/PropertyApprovalsPage"));
const UserManagementPage = lazy(() => import("./pages/admin/UserManagementPage"));
const AllPropertiesPage = lazy(() => import("./pages/admin/AllPropertiesPage"));
const ActivityLogPage = lazy(() => import("./pages/admin/ActivityLogPage"));

const queryClient = new QueryClient();

/**
 * Main App Component
 * 
 * Sets up routing with protected routes based on user roles.
 * Wraps app with context providers for authentication, properties, and notifications.
 * Uses lazy loading for code splitting to improve initial load performance.
 * 
 * Requirements: 2.1, 2.6, 21.4, 22.1
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PropertyProvider>
            <NotificationProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/aadhar-upload" element={<AadharUploadPage />} />
                  <Route path="/pending-approval" element={<PendingApprovalPage />} />

                  {/* Protected Routes - Buyer Only */}
                  <Route
                    path="/properties"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.BUYER]}
                        requireApproval={true}
                      >
                        <PropertiesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties/map"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.BUYER]}
                        requireApproval={true}
                      >
                        <PropertiesMapPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties/:id"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.BUYER]}
                        requireApproval={true}
                      >
                        <PropertyDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.BUYER, UserRole.SELLER, UserRole.AGENT, UserRole.ADMIN]}
                        requireApproval={true}
                      >
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.BUYER, UserRole.SELLER, UserRole.AGENT, UserRole.ADMIN]}
                        requireApproval={true}
                      >
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Routes - Buyer Only */}
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.BUYER]}
                        requireApproval={true}
                      >
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-inquiries"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.BUYER]}
                        requireApproval={true}
                      >
                        <MyInquiriesPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Routes - Settings (All Roles) */}
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.BUYER, UserRole.SELLER, UserRole.AGENT, UserRole.ADMIN]}
                        requireApproval={true}
                      >
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Routes - Seller/Agent */}
                  <Route
                    path="/my-properties"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.SELLER, UserRole.AGENT]}
                        requireApproval={true}
                      >
                        <MyPropertiesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties/new"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.SELLER, UserRole.AGENT]}
                        requireApproval={true}
                      >
                        <CreatePropertyPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties/:id/edit"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.SELLER, UserRole.AGENT]}
                        requireApproval={true}
                      >
                        <EditPropertyPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/received-inquiries"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.SELLER, UserRole.AGENT]}
                        requireApproval={true}
                      >
                        <ReceivedInquiriesPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Routes - Admin Only */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.ADMIN]}
                        requireApproval={false}
                      >
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/approvals/users"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.ADMIN]}
                        requireApproval={false}
                      >
                        <UserApprovalsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/approvals/properties"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.ADMIN]}
                        requireApproval={false}
                      >
                        <PropertyApprovalsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.ADMIN]}
                        requireApproval={false}
                      >
                        <UserManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/properties"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.ADMIN]}
                        requireApproval={false}
                      >
                        <AllPropertiesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/activity"
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.ADMIN]}
                        requireApproval={false}
                      >
                        <ActivityLogPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </NotificationProvider>
          </PropertyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
