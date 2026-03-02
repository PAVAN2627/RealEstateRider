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
 * Implements automatic retry on first attempt failure (common Firebase issue)
 * 
 * @returns Promise<User> - Authenticated user object
 * @throws Error if Google sign-in fails
 * 
 * Requirement: Google OAuth authentication
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  
  // Configure provider for better UX
  provider.setCustomParameters({
    prompt: 'select_account', // Always show account selection
    display: 'popup',
  });

  let userCredential;
  let retryCount = 0;
  const maxRetries = 3; // Allow three automatic retries
  const retryDelays = [600, 1000, 1500]; // Progressive delays

  while (retryCount <= maxRetries) {
    try {
      userCredential = await signInWithPopup(auth, provider);
      
      // Success! Log if it took retries
      if (retryCount > 0) {
        console.log(`✅ Sign-in succeeded on attempt ${retryCount + 1}`);
      }
      
      break; // Success, exit loop
    } catch (popupError: any) {
      const attemptNum = retryCount + 1;
      
      // Log the error for debugging
      console.log(`❌ Sign-in attempt ${attemptNum} failed:`, popupError.code);
      
      // Check if this is a retryable error
      const isRetryableError = 
        popupError.code === 'auth/cancelled-popup-request' || 
        popupError.code === 'auth/internal-error' ||
        popupError.message?.includes('INTERNAL ASSERTION FAILED') ||
        popupError.message?.includes('Pending promise was never set');
      
      // If we can retry and it's a retryable error, do so
      if (retryCount < maxRetries && isRetryableError) {
        const delay = retryDelays[retryCount] || 1500;
        console.log(`🔄 Retrying in ${delay}ms...`);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Handle user-initiated cancellations (don't retry)
      if (popupError.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in window was closed before completing. Please click "Sign in with Google" again and select your account in the popup.');
      } else if (popupError.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (popupError.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (popupError.code === 'auth/unauthorized-domain') {
        throw new Error('⚠️ Domain not authorized! Admin: Add this domain to Firebase Console → Authentication → Authorized domains');
      } else if (popupError.code === 'auth/operation-not-allowed') {
        throw new Error('Google Sign-In is not enabled. Please contact support.');
      }
      
      // If we've exhausted retries
      if (retryCount >= maxRetries) {
        console.error('❌ Sign-in failed after all retry attempts');
        throw new Error('Sign-in failed after multiple attempts. Please refresh the page and try again.');
      }
      
      // Unknown error, throw it
      throw popupError;
    }
  }

  // If we exhausted retries without success
  if (!userCredential) {
    throw new Error('Sign-in failed. Please refresh the page and try again.');
  }

  try {
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
    // Handle errors during user document operations
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
