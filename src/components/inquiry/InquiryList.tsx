/**
 * InquiryList Component
 * 
 * Renders list of InquiryCard components with filtering by status,
 * sorting by timestamp (most recent first), and empty state handling.
 * 
 * Requirements: 9.3, 9.4
 */

import React, { useState, useMemo } from 'react';
import { Filter, MessageSquare } from 'lucide-react';
import { Inquiry, InquiryStatus } from '../../types/inquiry.types';
import { Property } from '../../types/property.types';
import InquiryCard from './InquiryCard';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import { Button } from '../ui/button';

/**
 * InquiryList props
 */
interface InquiryListProps {
  inquiries: Inquiry[];
  properties: Map<string, Property>;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onResponseSubmitted?: () => void;
}

/**
 * Filter status type
 */
type FilterStatus = 'all' | InquiryStatus.PENDING | InquiryStatus.RESPONDED;

/**
 * InquiryList Component
 * 
 * Displays a filtered and sorted list of inquiry cards with status tabs.
 * Handles loading, error, and empty states appropriately.
 * 
 * Requirements:
 * - 9.3: Display all received inquiries in Agent Dashboard
 * - 9.4: Display all sent inquiries with status in Buyer Dashboard
 */
export default function InquiryList({
  inquiries,
  properties,
  loading = false,
  error = null,
  onRefresh,
  onResponseSubmitted,
}: InquiryListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  /**
   * Filter and sort inquiries
   * - Filter by status
   * - Sort by timestamp (most recent first)
   */
  const filteredAndSortedInquiries = useMemo(() => {
    let filtered = inquiries;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = inquiries.filter(inquiry => inquiry.status === filterStatus);
    }

    // Sort by timestamp (most recent first)
    return filtered.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
  }, [inquiries, filterStatus]);

  /**
   * Calculate counts for each status
   */
  const statusCounts = useMemo(() => {
    return {
      all: inquiries.length,
      pending: inquiries.filter(i => i.status === InquiryStatus.PENDING).length,
      responded: inquiries.filter(i => i.status === InquiryStatus.RESPONDED).length,
    };
  }, [inquiries]);

  /**
   * Get button variant based on active filter
   */
  const getButtonVariant = (status: FilterStatus): 'default' | 'outline' => {
    return filterStatus === status ? 'default' : 'outline';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading inquiries..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Inquiries"
        message={error}
        onRetry={onRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter by status:</span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={getButtonVariant('all')}
            size="sm"
            onClick={() => setFilterStatus('all')}
            className="min-w-[100px]"
          >
            All
            <span className="ml-2 px-2 py-0.5 rounded-full bg-background text-xs">
              {statusCounts.all}
            </span>
          </Button>
          
          <Button
            variant={getButtonVariant(InquiryStatus.PENDING)}
            size="sm"
            onClick={() => setFilterStatus(InquiryStatus.PENDING)}
            className="min-w-[100px]"
          >
            Pending
            <span className="ml-2 px-2 py-0.5 rounded-full bg-background text-xs">
              {statusCounts.pending}
            </span>
          </Button>
          
          <Button
            variant={getButtonVariant(InquiryStatus.RESPONDED)}
            size="sm"
            onClick={() => setFilterStatus(InquiryStatus.RESPONDED)}
            className="min-w-[100px]"
          >
            Responded
            <span className="ml-2 px-2 py-0.5 rounded-full bg-background text-xs">
              {statusCounts.responded}
            </span>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedInquiries.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          <div className="rounded-full bg-muted p-6 mb-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Inquiries Found</h3>
          <p className="text-muted-foreground max-w-md">
            {filterStatus === 'all'
              ? "You don't have any inquiries yet. Check back later for new messages."
              : `No ${filterStatus} inquiries found. Try selecting a different filter.`}
          </p>
        </div>
      )}

      {/* Inquiry Cards List */}
      {filteredAndSortedInquiries.length > 0 && (
        <div className="space-y-4">
          {filteredAndSortedInquiries.map((inquiry) => {
            const property = properties.get(inquiry.propertyId);
            
            // Skip if property not found
            if (!property) {
              return null;
            }

            return (
              <InquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                property={property}
                onResponseSubmitted={onResponseSubmitted}
              />
            );
          })}
        </div>
      )}

      {/* Results Summary */}
      {filteredAndSortedInquiries.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredAndSortedInquiries.length} of {inquiries.length} inquiries
        </div>
      )}
    </div>
  );
}
