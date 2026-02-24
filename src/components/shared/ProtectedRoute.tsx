/**
 * ProtectedRoute Component
 * 
 * Route guard component that checks authentication status, user role,
 * and approval status before allowing access to protected routes.
 * 
 * Requirements: 1.5, 2.1, 2.6
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user.types';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute props
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requireApproval?: boolean;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication and/or specific roles.
 * Redirects to login if not authenticated, or to unauthorized page if role doesn't match.
 * 
 * Requirements:
 * - 1.5: Deny login access when user's account has rejected or suspended verification status
 * - 2.1: Verify user's role permissions before granting access
 * - 2.6: Deny access and return authorization error when user attempts unauthorized features
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  requireApproval = true,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasRole, isApproved } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (!hasRole(allowedRoles)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-lg text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Required role: {allowedRoles.join(', ')}
          </p>
          <p className="text-sm text-muted-foreground">
            Your role: {user?.role}
          </p>
        </div>
      </div>
    );
  }

  // Check if approval is required and user is approved
  if (requireApproval && !isApproved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-yellow-600 mb-4">Account Pending Approval</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Your account is currently pending admin approval.
          </p>
          <p className="text-sm text-muted-foreground">
            You will be able to access this page once your account has been approved by an administrator.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Status: <span className="font-semibold capitalize">{user?.verificationStatus}</span>
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, has correct role, and is approved (if required)
  return <>{children}</>;
}
