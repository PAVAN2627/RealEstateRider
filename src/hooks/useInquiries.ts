/**
 * useInquiries Hook
 * 
 * Custom hook for managing inquiry operations including:
 * - Fetching inquiries by buyer
 * - Fetching inquiries by agent
 * - Sending inquiries
 * - Responding to inquiries
 * 
 * Requirements: 9.3, 9.4, 9.6
 */

import { useState, useCallback } from 'react';
import { Inquiry, CreateInquiryData } from '../types/inquiry.types';
import * as inquiryService from '../services/inquiryService';

/**
 * useInquiries hook return type
 */
interface UseInquiriesReturn {
  inquiries: Inquiry[];
  loading: boolean;
  error: string | null;
  fetchInquiriesByBuyer: (buyerId: string) => Promise<void>;
  fetchInquiriesByAgent: (agentId: string) => Promise<void>;
  sendInquiry: (inquiryData: CreateInquiryData) => Promise<Inquiry>;
  respondToInquiry: (inquiryId: string, response: string) => Promise<void>;
}

/**
 * Custom hook for inquiry operations
 * 
 * Provides functions to fetch, create, and respond to inquiries
 * with loading and error state management.
 * 
 * @returns UseInquiriesReturn - Inquiry operations and state
 * 
 * Requirements:
 * - 9.3: Display all received inquiries in the Agent Dashboard
 * - 9.4: Display all sent inquiries with status in the Buyer Dashboard
 * - 9.6: Allow agents to respond to inquiries
 */
export function useInquiries(): UseInquiriesReturn {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch inquiries sent by a buyer
   * 
   * @param buyerId - The buyer's user ID
   * 
   * Requirement 9.4: Display all sent inquiries with status in the Buyer Dashboard
   */
  const fetchInquiriesByBuyer = useCallback(async (buyerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedInquiries = await inquiryService.getInquiriesByBuyer(buyerId);
      setInquiries(fetchedInquiries);
    } catch (err) {
      console.error('Error fetching buyer inquiries:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inquiries';
      setError(errorMessage);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch inquiries received by an agent
   * 
   * @param agentId - The agent's user ID
   * 
   * Requirement 9.3: Display all received inquiries in the Agent Dashboard
   */
  const fetchInquiriesByAgent = useCallback(async (agentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedInquiries = await inquiryService.getInquiriesByAgent(agentId);
      setInquiries(fetchedInquiries);
    } catch (err) {
      console.error('Error fetching agent inquiries:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inquiries';
      setError(errorMessage);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send a new inquiry
   * 
   * @param inquiryData - Data for creating the inquiry
   * @returns Promise resolving to the created Inquiry
   * @throws Error if inquiry creation fails
   * 
   * Requirement 9.1: Create inquiry with validation
   */
  const sendInquiry = useCallback(async (inquiryData: CreateInquiryData): Promise<Inquiry> => {
    setLoading(true);
    setError(null);
    
    try {
      const newInquiry = await inquiryService.createInquiry(inquiryData);
      return newInquiry;
    } catch (err) {
      console.error('Error sending inquiry:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send inquiry';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Respond to an inquiry (agent only)
   * 
   * @param inquiryId - The inquiry document ID
   * @param response - The agent's response message
   * @throws Error if response fails
   * 
   * Requirement 9.6: Allow agents to respond to inquiries
   */
  const respondToInquiry = useCallback(async (inquiryId: string, response: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await inquiryService.respondToInquiry(inquiryId, response);
      
      // Update local state to reflect the response
      setInquiries(prevInquiries =>
        prevInquiries.map(inquiry =>
          inquiry.id === inquiryId
            ? { ...inquiry, response, status: 'responded' as const }
            : inquiry
        )
      );
    } catch (err) {
      console.error('Error responding to inquiry:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to respond to inquiry';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    inquiries,
    loading,
    error,
    fetchInquiriesByBuyer,
    fetchInquiriesByAgent,
    sendInquiry,
    respondToInquiry,
  };
}
