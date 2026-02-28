/**
 * RegisterForm Component
 * 
 * User registration form with email, password, and role selection.
 * Includes validation and redirects to Aadhar upload after successful registration.
 * 
 * Requirements: 1.1, 21.2
 */

import React, { useState } from 'react';
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
import { uploadAadharDocument } from '../../services/storageService';

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [aadharDocument, setAadharDocument] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Check if form is complete (all required fields filled)
   */
  const isFormComplete = (): boolean => {
    // Common required fields
    if (!name || !email || !phone || !password || !confirmPassword || !role) return false;
    
    // Admin secret key for admin users
    if (role === UserRole.ADMIN && !adminSecretKey) return false;
    
    // Aadhar document for non-admin users
    if (role !== UserRole.ADMIN && !aadharDocument) return false;
    
    return true;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name || name.trim().length === 0) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!phone || phone.trim().length === 0) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      errors.phone = 'Phone number must be 10 digits';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    // Validate Aadhar document for non-admin users
    if (role !== UserRole.ADMIN && !aadharDocument) {
      errors.aadharDocument = 'Aadhar document is required for verification';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Register user first
      const userId = await register(email, password, role as UserRole, name.trim(), phone.trim());
      
      // Upload Aadhar document for non-admin users
      if (role !== UserRole.ADMIN && aadharDocument && userId) {
        await uploadAadharDocument(aadharDocument, userId);
      }
      
      // Redirect based on role
      if (role === UserRole.ADMIN) {
        // Admin goes directly to dashboard
        navigate('/dashboard');
      } else if (role === UserRole.AGENT) {
        // Agents need approval, redirect to pending approval page
        navigate('/pending-approval');
      } else {
        // Buyers and Sellers are auto-approved, go directly to dashboard
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
        <CardDescription>Create your RealEstateRider account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors(prev => ({ ...prev, name: undefined }));
              }}
              className={fieldErrors.name ? 'border-red-500' : ''}
              disabled={loading}
            />
            {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors(prev => ({ ...prev, email: undefined }));
              }}
              className={fieldErrors.email ? 'border-red-500' : ''}
              disabled={loading}
            />
            {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/\D/g, '');
                setPhone(value);
                setFieldErrors(prev => ({ ...prev, phone: undefined }));
              }}
              maxLength={10}
              className={fieldErrors.phone ? 'border-red-500' : ''}
              disabled={loading}
            />
            {fieldErrors.phone && <p className="text-sm text-red-500">{fieldErrors.phone}</p>}
            <p className="text-xs text-muted-foreground">Enter 10-digit mobile number</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors(prev => ({ ...prev, password: undefined }));
              }}
              className={fieldErrors.password ? 'border-red-500' : ''}
              disabled={loading}
            />
            {fieldErrors.password && <p className="text-sm text-red-500">{fieldErrors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
              className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
              disabled={loading}
            />
            {fieldErrors.confirmPassword && <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => {
              setRole(value as UserRole);
              setFieldErrors(prev => ({ ...prev, role: undefined }));
            }} disabled={loading}>
              <SelectTrigger className={fieldErrors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.BUYER}>Buyer</SelectItem>
                <SelectItem value={UserRole.SELLER}>Seller</SelectItem>
                <SelectItem value={UserRole.AGENT}>Be an Agent</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
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

          {/* Aadhar Document Upload - Only for non-admin users */}
          {role !== UserRole.ADMIN && (
            <div className="space-y-2">
              <Label htmlFor="aadharDocument">
                Aadhar Document <span className="text-red-500">*</span>
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
                Upload your Aadhar card for verification (PDF, JPG, or PNG, max 500KB)
              </p>
            </div>
          )}

          {error && <ErrorMessage message={error} />}

          <Button type="submit" className="w-full" disabled={loading || !isFormComplete()}>
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Creating account...</span>
              </>
            ) : (
              'Register'
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary hover:underline"
              disabled={loading}
            >
              Login here
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
