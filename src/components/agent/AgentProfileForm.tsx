/**
 * AgentProfileForm Component
 * 
 * Form component for creating and editing agent professional profiles.
 * Supports profile photo upload, contact information, and professional details.
 * 
 * Requirements: 10.2, 10.3
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import ImageUpload from '../shared/ImageUpload';
import ErrorMessage from '../shared/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { AgentProfile } from '../../types/user.types';
import { createAgentProfile, updateAgentProfile } from '../../services/agentProfileService';
import { uploadAgentPhoto } from '../../services/storageService';

/**
 * AgentProfileForm props
 */
interface AgentProfileFormProps {
  agentProfile?: AgentProfile;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Form data interface
 */
interface FormData {
  name: string;
  phone: string;
  email: string;
  experience: string;
  specialization: string;
}

/**
 * Form validation errors
 */
interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  experience?: string;
  specialization?: string;
}

/**
 * AgentProfileForm Component
 * 
 * Provides form for creating and editing agent profiles with:
 * - All required profile fields (name, phone, email, experience, specialization)
 * - Profile photo upload integration
 * - Form validation (required fields, phone format, email format)
 * - Loading states and error handling
 * - Success message on completion
 * 
 * Requirements:
 * - 10.2: Allow agents to update profile fields
 * - 10.3: Support profile photo upload
 */
export default function AgentProfileForm({ 
  agentProfile, 
  onSuccess, 
  onCancel 
}: AgentProfileFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!agentProfile;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: agentProfile?.name || '',
    phone: agentProfile?.phone || '',
    email: agentProfile?.email || user?.email || '',
    experience: agentProfile?.experience || '',
    specialization: agentProfile?.specialization || '',
  });

  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | undefined>(
    agentProfile?.profilePhotoUrl
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Validate email format
   * 
   * @param email - Email address to validate
   * @returns boolean - True if email is valid
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate phone format
   * 
   * @param phone - Phone number to validate
   * @returns boolean - True if phone is valid
   */
  const isValidPhone = (phone: string): boolean => {
    // Accept 10 digits with optional country code and formatting
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  };

  /**
   * Validate form data
   * 
   * @returns boolean - True if form is valid
   * 
   * Requirement 10.2: Validate all required fields
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handle profile photo upload
   */
  const handlePhotoUpload = async (files: File[]) => {
    if (files.length > 0) {
      setProfilePhotoFile(files[0]);
    }
  };

  /**
   * Handle remove existing photo
   */
  const handleRemoveExistingPhoto = () => {
    setExistingPhoto(undefined);
  };

  /**
   * Handle form submission
   * 
   * Requirements:
   * - 10.2: Create or update agent profile
   * - 10.3: Upload profile photo to storage
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError('You must be logged in to manage your profile');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let profilePhotoUrl = existingPhoto;

      // Upload new profile photo if selected
      if (profilePhotoFile) {
        const tempAgentId = agentProfile?.id || `temp_${user.uid}`;
        profilePhotoUrl = await uploadAgentPhoto(profilePhotoFile, tempAgentId);
      }

      if (isEditMode && agentProfile) {
        // Update existing profile
        await updateAgentProfile(agentProfile.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          experience: formData.experience.trim(),
          specialization: formData.specialization.trim(),
          profilePhotoUrl,
        });
      } else {
        // Create new profile
        await createAgentProfile({
          userId: user.uid,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          experience: formData.experience.trim(),
          specialization: formData.specialization.trim(),
          profilePhotoUrl,
          verified: false,
        });
      }

      setSuccess(true);

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting agent profile:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to save profile. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          {isEditMode ? 'Edit Agent Profile' : 'Create Agent Profile'}
        </h2>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Update your professional profile information'
            : 'Set up your professional profile to start managing properties'}
        </p>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          Profile {isEditMode ? 'updated' : 'created'} successfully!
        </div>
      )}

      {/* Profile Photo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Profile Photo</h3>
        <p className="text-sm text-muted-foreground">
          Upload a professional photo (max 5MB)
        </p>
        <ImageUpload
          onUpload={handlePhotoUpload}
          maxFiles={1}
          maxSizeMB={5}
          multiple={false}
          existingImages={existingPhoto ? [existingPhoto] : []}
          onRemoveExisting={handleRemoveExistingPhoto}
        />
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., John Doe"
            disabled={submitting}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="e.g., +91 98765 43210"
            disabled={submitting}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="e.g., john.doe@example.com"
            disabled={submitting}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Professional Information</h3>

        {/* Experience */}
        <div className="space-y-2">
          <Label htmlFor="experience">
            Experience <span className="text-red-500">*</span>
          </Label>
          <Input
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            placeholder="e.g., 5 years"
            disabled={submitting}
          />
          {errors.experience && (
            <p className="text-sm text-red-500">{errors.experience}</p>
          )}
        </div>

        {/* Specialization */}
        <div className="space-y-2">
          <Label htmlFor="specialization">
            Specialization <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            placeholder="e.g., Residential Properties, Luxury Apartments"
            rows={3}
            disabled={submitting}
          />
          {errors.specialization && (
            <p className="text-sm text-red-500">{errors.specialization}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={submitting} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          {submitting
            ? isEditMode
              ? 'Updating...'
              : 'Creating...'
            : isEditMode
            ? 'Update Profile'
            : 'Create Profile'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={submitting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
