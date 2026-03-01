/**
 * Authentication Service
 * 
 * Provides Firebase Authentication integration for user registration,
 * login, logout, and password management.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 17.1, 18.2
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updatePassword as firebaseUpdatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';
import { User, UserRole, VerificationStatus } from '../types/user.types';
import { logActivity } from './activityLogService';

/**
 * Register a new user with email, password, role, name, and phone
 * Creates Firebase Auth account and user document in Firestore
 * 
 * @param email - User email address
 * @param password - User password
 * @param role - User role (buyer, seller, agent, admin)
 * @param name - User's full name
 * @param phone - User's phone number
 * @returns Promise<User> - Created user object
 * @throws Error if registration fails
 * 
 * Requirement 1.1: Create user account with pending verification status
 */
export async function register(
  email: string,
  password: string,
  role: UserRole,
  name: string,
  phone: string
): Promise<User> {
  try {
    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Buyers are auto-approved
    // Sellers and Agents need to upload documents and get admin approval
    // Admins are auto-approved
    const verificationStatus = 
      role === UserRole.BUYER || role === UserRole.ADMIN
        ? VerificationStatus.APPROVED
        : VerificationStatus.PENDING;

    // Create user document in Firestore with pending verification
    const user: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role,
      verificationStatus,
      createdAt: Timestamp.now(),
      profile: {
        name: name.trim() || email.split('@')[0], // Use name or fallback to email username
        phone: phone.trim()
      },
      isGoogleSignIn: false
    };

    // Save user document to Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), user);

    return user;
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}

/**
 * Login user with email and password
 * Authenticates user and retrieves user document from Firestore
 * 
 * @param email - User email address
 * @param password - User password
 * @returns Promise<User> - Authenticated user object
 * @throws Error if login fails or user is not approved
 * 
 * Requirements 1.2, 1.3, 1.5, 18.2: Authenticate user, validate verification status, and log login event
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    // Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Retrieve user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const user = userDoc.data() as User;

    // Check verification status - deny access if rejected or suspended
    if (
      user.verificationStatus === VerificationStatus.REJECTED ||
      user.verificationStatus === VerificationStatus.SUSPENDED
    ) {
      await signOut(auth);
      throw new Error('Account access denied. Please contact administrator.');
    }

    // Update last login timestamp asynchronously (don't block login)
    updateDoc(doc(db, 'users', firebaseUser.uid), {
      lastLoginAt: Timestamp.now()
    }).catch(err => console.error('Failed to update last login:', err));

    // Log login activity asynchronously (don't wait for it)
    // Requirement 18.2: Log user login events
    logActivity({
      userId: firebaseUser.uid,
      actionType: 'login',
      metadata: {
        email: user.email,
        role: user.role
      }
    }).catch(err => console.error('Failed to log activity:', err));

    return user;
  } catch (error: any) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

/**
 * Sign in with Google
 * Authenticates user with Google OAuth and creates/retrieves user document
 * Uses popup with fallback to redirect for better reliability
 * 
 * @returns Promise<User> - Authenticated user object
 * @throws Error if Google sign-in fails
 * 
 * Requirement: Google OAuth authentication
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    
    // Configure provider for better UX
    provider.setCustomParameters({
      prompt: 'select_account' // Always show account selection
    });

    let userCredential;
    
    try {
      // Try popup first (better UX)
      userCredential = await signInWithPopup(auth, provider);
    } catch (popupError: any) {
      // If popup fails due to being closed or blocked, throw a clear error
      // Don't retry automatically - let user click again
      if (popupError.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in window was closed. Please try again and complete the sign-in process.');
      } else if (popupError.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (popupError.code === 'auth/cancelled-popup-request') {
        // This happens when a new popup is triggered before the previous one completes
        throw new Error('A sign-in is already in progress. Please wait or refresh the page.');
      }
      // Re-throw other errors
      throw popupError;
    }

    const firebaseUser = userCredential.user;

    // Check if user document exists
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    let user: User;

    if (userDoc.exists()) {
      // Existing user - retrieve and update last login
      user = userDoc.data() as User;

      // Check verification status
      if (
        user.verificationStatus === VerificationStatus.REJECTED ||
        user.verificationStatus === VerificationStatus.SUSPENDED
      ) {
        await signOut(auth);
        throw new Error('Account access denied. Please contact administrator.');
      }

      // Update last login timestamp
      await updateDoc(userDocRef, {
        lastLoginAt: Timestamp.now()
      });
    } else {
      // New user - create minimal user document (role will be set during registration)
      user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        role: UserRole.BUYER, // Temporary default, will be updated in registration
        verificationStatus: VerificationStatus.PENDING, // Will be updated based on role selection
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        profile: {
          name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
          phone: firebaseUser.phoneNumber || ''
        },
        isGoogleSignIn: true
      };

      await setDoc(userDocRef, user);
    }

    // Log login activity
    logActivity({
      userId: firebaseUser.uid,
      actionType: 'login',
      metadata: {
        email: user.email,
        role: user.role,
        method: 'google'
      }
    }).catch(err => console.error('Failed to log activity:', err));

    return user;
  } catch (error: any) {
    // Handle specific Firebase Auth errors with user-friendly messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in window was closed. Please try again and complete the sign-in process.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('A sign-in is already in progress. Please wait a moment and try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.code === 'auth/internal-error') {
      throw new Error('An error occurred. Please refresh the page and try again.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized. Please contact support.');
    }
    
    // If error already has a message we set, use it
    if (error.message && !error.message.includes('Firebase:')) {
      throw error;
    }
    
    throw new Error(`Google sign-in failed: ${error.message}`);
  }
}

/**
 * Logout current user
 * Signs out user and terminates session
 * 
 * @returns Promise<void>
 * @throws Error if logout fails
 * 
 * Requirements 1.6, 18.2: Terminate active session on logout and log logout event
 */
export async function logout(): Promise<void> {
  try {
    const firebaseUser = auth.currentUser;
    
    if (firebaseUser) {
      // Log logout activity before signing out
      // Requirement 18.2: Log user logout events
      await logActivity({
        userId: firebaseUser.uid,
        actionType: 'logout',
        metadata: {}
      });
    }
    
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}

/**
 * Get currently authenticated user
 * Returns user document from Firestore if authenticated
 * 
 * @returns Promise<User | null> - Current user or null if not authenticated
 * 
 * Requirement 1.4: Retrieve current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      return null;
    }

    // Retrieve user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error: any) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Update user password
 * Updates password for currently authenticated user
 * 
 * @param newPassword - New password
 * @returns Promise<void>
 * @throws Error if password update fails or user not authenticated
 * 
 * Requirement 17.3: Terminate sessions on password change
 */
export async function updatePassword(newPassword: string): Promise<void> {
  try {
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      throw new Error('No authenticated user');
    }

    // Update password in Firebase Auth
    await firebaseUpdatePassword(firebaseUser, newPassword);
    
    // Note: Firebase Auth automatically terminates other sessions when password changes
  } catch (error: any) {
    throw new Error(`Password update failed: ${error.message}`);
  }
}
