/**
 * Authentication Context
 * 
 * Provides authentication state management and operations throughout the app.
 * Manages user state, loading states, and authentication functions.
 * 
 * Requirements: 1.1, 1.2, 1.5, 1.6, 2.1, 17.1
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase.config';
import { User, UserRole, VerificationStatus } from '../types/user.types';
import * as authService from '../services/authService';

/**
 * Authentication context value interface
 */
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<string | undefined>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  isApproved: boolean;
}

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Wraps the app and provides authentication state to all child components.
 * Sets up Firebase auth state listener to sync authentication state.
 * 
 * Requirements:
 * - 1.1: User registration with role selection
 * - 1.2: User authentication with session creation
 * - 1.6: Session termination on logout
 * - 2.1: Role-based access control
 * - 17.1: Session management with Firebase Auth
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Set up Firebase auth state listener
   * Syncs authentication state with Firebase Auth
   * 
   * Requirement 17.1: Session management and validation
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user document from Firestore
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Login function
   * Authenticates user with email and password
   * 
   * @param email - User email address
   * @param password - User password
   * @throws Error if login fails
   * 
   * Requirement 1.2: User authentication with credential validation
   */
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register function
   * Creates new user account with email, password, and role
   * 
   * @param email - User email address
   * @param password - User password
   * @param role - User role (buyer, seller, agent, admin)
   * @throws Error if registration fails
   * 
   * Requirement 1.1: User registration with role selection and pending verification
   */
  const register = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<string | undefined> => {
    setLoading(true);
    try {
      const userData = await authService.register(email, password, role);
      setUser(userData);
      return userData.uid;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   * Signs out user and terminates session
   * 
   * @throws Error if logout fails
   * 
   * Requirement 1.6: Session termination on logout
   */
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user is authenticated
   * 
   * @returns boolean - True if user is authenticated
   */
  const isAuthenticated = !!user;

  /**
   * Check if user has one of the specified roles
   * 
   * @param roles - Array of allowed roles
   * @returns boolean - True if user has one of the roles
   * 
   * Requirement 2.1: Role-based access control
   */
  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  /**
   * Check if user is approved
   * 
   * @returns boolean - True if user verification status is approved
   * 
   * Requirement 1.5: Deny access to rejected or suspended accounts
   */
  const isApproved = user?.verificationStatus === VerificationStatus.APPROVED;

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    isApproved,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use authentication context
 * 
 * @returns AuthContextValue - Authentication context value
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
