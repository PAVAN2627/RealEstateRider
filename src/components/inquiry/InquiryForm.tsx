/**
 * InquiryForm Component
 * 
 * Form for buyers to send inquiries to agents about properties.
 * Includes message textarea with character counter, validation,
 * loading state, and success confirmation.
 * 
 * Requirements: 9.1, 9.2, 21.2
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInquiries } from '../../hooks/useInquiries';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';

const MAX_MESSAGE_LENGTH = 1000;

interface InquiryFormProps {
  propertyId: string;
  agentId: string;
  onSuccess?: () => void;
}

/**
 * InquiryForm Component
 * 
 * Provides a textarea for buyers to send inquiries about properties.
 * Validates message length (max 1000 chars) and displays character counter.
 * Shows loading state during submission and success message on completion.
 * 
 * Requirements:
 * - 9.1: Create inquiry with message text for a property
 * - 9.2: Require inquiry message to be non-empty and less than 1000 characters
 * - 21.2: Highlight invalid fields and display specific validation messages
 */
export default function InquiryForm({ propertyId, agentId, onSuccess }: InquiryFormProps) {
  const { user } = useAuth();
  const { sendInquiry, loading } = useInquiries();
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const characterCount = message.length;
  const isOverLimit = characterCount > MAX_MESSAGE_LENGTH;
  const isEmpty = message.trim().length === 0;

  const validateMessage = (): boolean => {
    if (isEmpty) {
      setFieldError('Message is required');
      return false;
    }
    
    if (isOverLimit) {
      setFieldError(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
      return false;
    }
    
    setFieldError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateMessage()) {
      return;
    }

    if (!user) {
      setError('You must be logged in to send an inquiry');
      return;
    }

    setError(null);
    setSuccess(false);

    try {
      await sendInquiry({
        propertyId,
        buyerId: user.uid,
        agentId,
        message: message.trim(),
      });
      
      // Show success message
      setSuccess(true);
      
      // Clear form
      setMessage('');
      setFieldError(null);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error sending inquiry:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send inquiry. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message Textarea */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="message">Your Message</Label>
            <span 
              className={`text-sm ${
                isOverLimit 
                  ? 'text-red-500 font-medium' 
                  : characterCount > MAX_MESSAGE_LENGTH * 0.9
                  ? 'text-yellow-600'
                  : 'text-muted-foreground'
              }`}
            >
              {characterCount} / {MAX_MESSAGE_LENGTH}
            </span>
          </div>
          <Textarea
            id="message"
            placeholder="Ask about this property, request a viewing, or inquire about additional details..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setFieldError(null);
              setError(null);
            }}
            className={`min-h-[120px] resize-y ${fieldError ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {fieldError && (
            <p className="text-sm text-red-500">{fieldError}</p>
          )}
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✓ Your inquiry has been sent successfully! The agent will respond soon.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || isEmpty || isOverLimit}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Sending...</span>
            </>
          ) : (
            'Send Inquiry'
          )}
        </Button>
      </form>
    </div>
  );
}
