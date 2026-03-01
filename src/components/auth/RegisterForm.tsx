/**
 * RegisterForm Component
 * 
 * User registration form with email, password, and role selection.
 * Includes validation and redirects to Aadhar upload after successful registration.
 * 
 * Requirements: 1.1, 21.2
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user.types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import { uploadAadharDocument, uploadSelfiePhoto } from '../../services/storageService';
import { updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase.config';

export default function RegisterForm() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // Step 1: Google Sign-In, Step 2: Additional Info
  const [step, setStep] = useState<'google' | 'details'>('google');
  const [googleUser, setGoogleUser] = useState<{ uid: string; email: string; name: string } | null>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [aadharDocument, setAadharDocument] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastGoogleAttempt, setLastGoogleAttempt] = useState<number>(0);

  /**
   * Check if form is complete (all required fields filled)
   */
  const isFormComplete = (): boolean => {
    // For Google sign-up flow
    if (step === 'details') {
      // Common required fields
      if (!phone || !role) return false;
      
      // Admin secret key for admin users
      if (role === UserRole.ADMIN && !adminSecretKey) return false;
      
      // For Sellers and Agents: Both ID proof and selfie are required
      if ((role === UserRole.SELLER || role === UserRole.AGENT) && (!aadharDocument || !selfiePhoto)) {
        return false;
      }
      
      return true;
    }
    
    return false;
  };

  /**
   * Handle Google Sign-Up
   */
  const handleGoogleSignUp = async () => {
    // Prevent multiple simultaneous attempts (debounce)
    const now = Date.now();
    if (now - lastGoogleAttempt < 2000) {
      setError('Please wait a moment before trying again.');
      return;
    }
    setLastGoogleAttempt(now);

    setGoogleLoading(true);
    setError(null);

    try {
      // Sign in with Google
      await loginWithGoogle();
      
      // Get the current user from Firebase Auth
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        setGoogleUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || firebaseUser.email!.split('@')[0]
        });
        setName(firebaseUser.displayName || '');
        setStep('details');
      }
    } catch (err) {
      console.error('Google sign-up error:', err);
      
      // Extract user-friendly error message
      let errorMessage = 'Google sign-up failed. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('closed') || err.message.includes('cancelled')) {
          errorMessage = 'Sign-up window was closed. Please click the button again and complete the sign-up.';
        } else if (err.message.includes('popup blocked') || err.message.includes('blocked')) {
          errorMessage = 'Popup was blocked. Please allow popups for this site in your browser settings.';
        } else if (err.message.includes('already in progress')) {
          errorMessage = 'A sign-up is already in progress. Please wait a moment and try again.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('refresh')) {
          errorMessage = err.message; // Use the refresh message
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // For Google sign-up details step
    if (step === 'details') {
      if (!phone || phone.trim().length === 0) {
        errors.phone = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(phone.trim())) {
        errors.phone = 'Phone number must be 10 digits';
      }

      if (!role) {
        errors.role = 'Please select a role';
      }

      // Validate admin secret key if role is admin
      if (role === UserRole.ADMIN) {
        if (!adminSecretKey || adminSecretKey.trim().length === 0) {
          errors.adminSecretKey = 'Admin secret key is required';
        } else if (adminSecretKey !== import.meta.env.VITE_ADMIN_SECRET_KEY) {
          errors.adminSecretKey = 'Invalid admin secret key';
        }
      }

      // Validate documents for Sellers and Agents
      if ((role === UserRole.SELLER || role === UserRole.AGENT) && !aadharDocument) {
        errors.aadharDocument = 'ID proof (Aadhar/PAN card) is required for verification';
      }

      if ((role === UserRole.SELLER || role === UserRole.AGENT) && !selfiePhoto) {
        errors.selfiePhoto = 'Live selfie photo is required for verification';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!googleUser) {
      setError('Please sign up with Google first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update user document with additional info
      const userRef = doc(db, 'users', googleUser.uid);
      
      // Determine verification status
      const verificationStatus = 
        role === UserRole.BUYER || role === UserRole.ADMIN
          ? 'approved'
          : 'pending';
      
      // Update user document
      await updateDoc(userRef, {
        role: role as UserRole,
        verificationStatus,
        profile: {
          name: name || googleUser.name,
          phone: phone.trim()
        }
      });
      
      // Upload documents for Sellers and Agents
      if ((role === UserRole.SELLER || role === UserRole.AGENT)) {
        // Upload Aadhar/ID proof
        if (aadharDocument) {
          const aadharUrl = await uploadAadharDocument(aadharDocument, googleUser.uid);
          await updateDoc(userRef, {
            aadharDocumentUrl: aadharUrl
          });
        }
        
        // Upload selfie photo
        if (selfiePhoto) {
          const selfieUrl = await uploadSelfiePhoto(selfiePhoto, googleUser.uid);
          await updateDoc(userRef, {
            selfiePhotoUrl: selfieUrl
          });
        }
      }
      
      // Redirect based on role
      if (role === UserRole.ADMIN) {
        navigate('/dashboard');
      } else if (role === UserRole.SELLER || role === UserRole.AGENT) {
        // Show success message for pending approval
        const roleLabel = role === UserRole.SELLER ? 'Seller' : 'Agent';
        alert(`Registration successful! Your ${roleLabel} account is pending admin approval. You will be notified once approved.`);
        navigate('/pending-approval');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          {step === 'google' 
            ? 'Sign up with your Google account to get started'
            : 'Complete your profile to finish registration'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step 1: Google Sign-Up */}
        {step === 'google' && (
          <div className="space-y-4">
            {error && <ErrorMessage message={error} />}
            
            <Button
              type="button"
              variant="default"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Signing up with Google...</span>
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </>
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline"
                disabled={googleLoading}
              >
                Login here
              </button>
            </p>
          </div>
        )}

        {/* Step 2: Additional Details Form */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Google User Info */}
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">{googleUser?.name}</p>
              <p className="text-xs text-muted-foreground">{googleUser?.email}</p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setPhone(value);
                  setFieldErrors(prev => ({ ...prev, phone: undefined }));
                }}
                maxLength={10}
                className={fieldErrors.phone ? 'border-red-500' : ''}
                disabled={loading}
              />
              {fieldErrors.phone && <p className="text-sm text-red-500">{fieldErrors.phone}</p>}
              <p className="text-xs text-muted-foreground">10 digits without country code</p>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">
                I want to <span className="text-red-500">*</span>
              </Label>
              <Select value={role} onValueChange={(value) => {
                setRole(value as UserRole);
                setFieldErrors(prev => ({ ...prev, role: undefined }));
              }} disabled={loading}>
                <SelectTrigger className={fieldErrors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.BUYER}>Buy Property</SelectItem>
                  <SelectItem value={UserRole.SELLER}>Sell Property</SelectItem>
                  <SelectItem value={UserRole.AGENT}>Be an Agent</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin Access</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.role && <p className="text-sm text-red-500">{fieldErrors.role}</p>}
            </div>

          {/* Admin Secret Key - Only shown when Admin role is selected */}
          {role === UserRole.ADMIN && (
            <div className="space-y-2">
              <Label htmlFor="adminSecretKey">
                Admin Secret Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="adminSecretKey"
                name="adminSecretKey"
                type="password"
                autoComplete="off"
                placeholder="Enter admin secret key"
                value={adminSecretKey}
                onChange={(e) => {
                  setAdminSecretKey(e.target.value);
                  setFieldErrors(prev => ({ ...prev, adminSecretKey: undefined }));
                }}
                className={fieldErrors.adminSecretKey ? 'border-red-500' : ''}
                disabled={loading}
              />
              {fieldErrors.adminSecretKey && (
                <p className="text-sm text-red-500">{fieldErrors.adminSecretKey}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Contact system administrator for the admin secret key
              </p>
            </div>
          )}

          {/* ID Proof and Selfie Upload - Only for Sellers and Agents */}
          {(role === UserRole.SELLER || role === UserRole.AGENT) && (
            <>
              {/* ID Proof (Aadhar/PAN) Upload */}
              <div className="space-y-2">
                <Label htmlFor="aadharDocument">
                  ID Proof (Aadhar/PAN Card) <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <Input
                        id="aadharDocument"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAadharDocument(e.target.files[0]);
                            setFieldErrors(prev => ({ ...prev, aadharDocument: undefined }));
                          }
                        }}
                        className={fieldErrors.aadharDocument ? 'border-red-500' : ''}
                        disabled={loading}
                      />
                      {aadharDocument && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected: {aadharDocument.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {fieldErrors.aadharDocument && (
                  <p className="text-sm text-red-500">{fieldErrors.aadharDocument}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload your Aadhar card or PAN card for verification (PDF, JPG, or PNG, max 500KB)
                </p>
              </div>

              {/* Live Selfie Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="selfiePhoto">
                  Live Selfie Photo <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <Input
                        id="selfiePhoto"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelfiePhoto(e.target.files[0]);
                            setFieldErrors(prev => ({ ...prev, selfiePhoto: undefined }));
                          }
                        }}
                        className={fieldErrors.selfiePhoto ? 'border-red-500' : ''}
                        disabled={loading}
                      />
                      {selfiePhoto && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected: {selfiePhoto.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {fieldErrors.selfiePhoto && (
                  <p className="text-sm text-red-500">{fieldErrors.selfiePhoto}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a current selfie photo for identity verification (JPG or PNG, max 500KB)
                </p>
              </div>
            </>
          )}

            {error && <ErrorMessage message={error} />}

            <Button type="submit" className="w-full" disabled={loading || !isFormComplete()}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Completing registration...</span>
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
