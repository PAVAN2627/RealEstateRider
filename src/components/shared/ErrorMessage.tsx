/**
 * ErrorMessage Component
 * 
 * Reusable error display component with optional retry functionality.
 * 
 * Requirements: 21.1, 21.3
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';

/**
 * ErrorMessage props
 */
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/**
 * ErrorMessage Component
 * 
 * Displays error messages with optional retry button.
 * 
 * Requirements:
 * - 21.1: Display user-friendly error message describing the issue
 * - 21.3: Display connection error message and suggest retry when network error occurs
 */
export default function ErrorMessage({ 
  title = 'Error', 
  message, 
  onRetry 
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4"
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
