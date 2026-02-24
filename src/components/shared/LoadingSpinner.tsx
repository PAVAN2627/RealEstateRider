/**
 * LoadingSpinner Component
 * 
 * Reusable loading indicator component.
 * 
 * Requirements: 21.1, 21.3, 22.6
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner props
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

/**
 * LoadingSpinner Component
 * 
 * Displays an animated loading spinner with optional text.
 * 
 * Requirement 22.6: Display loading indicator when Database response time exceeds 5 seconds
 */
export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
