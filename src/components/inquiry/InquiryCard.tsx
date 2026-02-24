/**
 * InquiryCard Component
 * 
 * Displays inquiry message, property details, timestamp, status,
 * and response if available. Shows respond button for agents.
 * 
 * Requirements: 9.3, 9.4, 9.8
 */

import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCircle, Home } from 'lucide-react';
import { Inquiry, InquiryStatus } from '../../types/inquiry.types';
import { Property } from '../../types/property.types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user.types';
import { respondToInquiry } from '../../services/inquiryService';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import InquiryChatModal from './InquiryChatModal';

interface InquiryCardProps {
  inquiry: Inquiry;
  property: Property;
  onResponseSubmitted?: () => void;
}

/**
 * InquiryCard Component
 * 
 * Displays inquiry details with property information, status badge,
 * and respond functionality for agents.
 * 
 * Requirements:
 * - 9.3: Display all received inquiries in Agent Dashboard
 * - 9.4: Display all sent inquiries with status in Buyer Dashboard
 * - 9.8: Display inquiry timestamp and property details with each inquiry
 */
export default function InquiryCard({ inquiry, property, onResponseSubmitted }: InquiryCardProps) {
  const { user } = useAuth();
  const [showRespondForm, setShowRespondForm] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isAgent = user?.role === UserRole.AGENT || user?.role === UserRole.SELLER;
  const isPending = inquiry.status === InquiryStatus.PENDING;

  /**
   * Format timestamp to readable date string
   */
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  /**
   * Handle respond form submission
   */
  const handleRespondSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      setError('Response cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await respondToInquiry(inquiry.id, responseText.trim());
      setSuccess(true);
      setShowRespondForm(false);
      setResponseText('');
      
      // Call callback if provided
      if (onResponseSubmitted) {
        onResponseSubmitted();
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error responding to inquiry:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send response. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get status badge based on inquiry status
   */
  const getStatusBadge = () => {
    if (inquiry.status === InquiryStatus.RESPONDED) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Responded
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          {/* Property Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Property Thumbnail */}
            <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
              {property.imageUrls && property.imageUrls.length > 0 ? (
                <img
                  src={property.imageUrls[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="h-6 w-6 text-gray-300" />
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base line-clamp-1 mb-1">
                {property.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {property.location.city}, {property.location.state}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Inquiry Message */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">Inquiry Message</span>
          </div>
          <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
            {inquiry.message}
          </p>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Sent on {formatTimestamp(inquiry.createdAt)}</span>
        </div>

        {/* Response Section */}
        {inquiry.response && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">Agent Response</span>
            </div>
            <p className="text-sm bg-green-50 p-3 rounded-md whitespace-pre-wrap border border-green-100">
              {inquiry.response}
            </p>
            {inquiry.respondedAt && (
              <p className="text-xs text-muted-foreground">
                Responded on {formatTimestamp(inquiry.respondedAt)}
              </p>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✓ Response sent successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Respond Form */}
        {showRespondForm && isAgent && isPending && (
          <form onSubmit={handleRespondSubmit} className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor={`response-${inquiry.id}`}>Your Response</Label>
              <Textarea
                id={`response-${inquiry.id}`}
                placeholder="Type your response to this inquiry..."
                value={responseText}
                onChange={(e) => {
                  setResponseText(e.target.value);
                  setError(null);
                }}
                className="min-h-[100px] resize-y"
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                size="sm"
                disabled={loading || !responseText.trim()}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  'Send Response'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowRespondForm(false);
                  setResponseText('');
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      {/* Footer with Respond Button */}
      {isAgent && isPending && !showRespondForm && (
        <CardFooter className="border-t pt-4">
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setShowRespondForm(true)}
            className="w-full sm:w-auto"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Respond to Inquiry
          </Button>
        </CardFooter>
      )}

      {/* View Chat Button - Always visible */}
      {!showRespondForm && (
        <CardFooter className={`${isAgent && isPending ? '' : 'border-t'} pt-4`}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowChatModal(true)}
            className="w-full sm:w-auto"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            View Chat
          </Button>
        </CardFooter>
      )}

      {/* Chat Modal */}
      <InquiryChatModal
        inquiry={inquiry}
        property={property}
        open={showChatModal}
        onClose={() => setShowChatModal(false)}
        onResponseSent={() => {
          setShowChatModal(false);
          if (onResponseSubmitted) {
            onResponseSubmitted();
          }
        }}
      />
    </Card>
  );
}
