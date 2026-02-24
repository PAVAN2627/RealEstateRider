/**
 * Agent Profile Service Tests
 * 
 * Unit tests for agent profile management operations
 * 
 * Requirements: 10.1, 10.2, 10.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { createAgentProfile, updateAgentProfile, getAgentProfile } from './agentProfileService';
import { AgentProfile } from '../types/user.types';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1234567890, nanoseconds: 0 }))
  }
}));

// Mock Firebase config
vi.mock('../config/firebase.config', () => ({
  db: {}
}));

describe('Agent Profile Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAgentProfile', () => {
    it('should create an agent profile successfully', async () => {
      // Arrange
      const mockAgentProfile = {
        userId: 'user123',
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        experience: '5 years',
        specialization: 'Residential Properties',
        verified: false
      };

      const mockDocRef = { id: 'agent123' };
      (collection as any).mockReturnValue({});
      (doc as any).mockReturnValue(mockDocRef);
      (setDoc as any).mockResolvedValue(undefined);

      // Act
      const result = await createAgentProfile(mockAgentProfile);

      // Assert
      expect(result).toMatchObject({
        ...mockAgentProfile,
        id: 'agent123'
      });
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, expect.objectContaining({
        ...mockAgentProfile,
        id: 'agent123'
      }));
    });

    it('should throw error when creation fails', async () => {
      // Arrange
      const mockAgentProfile = {
        userId: 'user123',
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        experience: '5 years',
        specialization: 'Residential Properties',
        verified: false
      };

      (collection as any).mockReturnValue({});
      (doc as any).mockReturnValue({ id: 'agent123' });
      (setDoc as any).mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(createAgentProfile(mockAgentProfile)).rejects.toThrow(
        'Failed to create agent profile. Please try again.'
      );
    });
  });

  describe('updateAgentProfile', () => {
    it('should update agent profile successfully', async () => {
      // Arrange
      const agentId = 'agent123';
      const updateData = {
        name: 'Jane Doe',
        experience: '7 years',
        specialization: 'Commercial Properties'
      };

      const mockDocRef = {};
      (doc as any).mockReturnValue(mockDocRef);
      (getDoc as any).mockResolvedValue({
        exists: () => true,
        data: () => ({
          id: agentId,
          userId: 'user123',
          name: 'John Doe',
          verified: false
        })
      });
      (updateDoc as any).mockResolvedValue(undefined);

      // Act
      await updateAgentProfile(agentId, updateData);

      // Assert
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, expect.objectContaining({
        ...updateData,
        updatedAt: expect.anything()
      }));
    });

    it('should throw error when agent profile not found', async () => {
      // Arrange
      const agentId = 'nonexistent';
      const updateData = { name: 'Jane Doe' };

      (doc as any).mockReturnValue({});
      (getDoc as any).mockResolvedValue({
        exists: () => false
      });

      // Act & Assert
      await expect(updateAgentProfile(agentId, updateData)).rejects.toThrow(
        'Failed to update agent profile. Agent profile not found'
      );
    });

    it('should throw error when update fails', async () => {
      // Arrange
      const agentId = 'agent123';
      const updateData = { name: 'Jane Doe' };

      (doc as any).mockReturnValue({});
      (getDoc as any).mockResolvedValue({
        exists: () => true
      });
      (updateDoc as any).mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(updateAgentProfile(agentId, updateData)).rejects.toThrow(
        'Failed to update agent profile'
      );
    });
  });

  describe('getAgentProfile', () => {
    it('should retrieve agent profile by user ID successfully', async () => {
      // Arrange
      const userId = 'user123';
      const mockAgentProfile: AgentProfile = {
        id: 'agent123',
        userId: userId,
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        experience: '5 years',
        specialization: 'Residential Properties',
        verified: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      (collection as any).mockReturnValue({});
      (query as any).mockReturnValue({});
      (where as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => mockAgentProfile
          }
        ]
      });

      // Act
      const result = await getAgentProfile(userId);

      // Assert
      expect(result).toEqual(mockAgentProfile);
      expect(collection).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('userId', '==', userId);
    });

    it('should return null when agent profile not found', async () => {
      // Arrange
      const userId = 'nonexistent';

      (collection as any).mockReturnValue({});
      (query as any).mockReturnValue({});
      (where as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue({
        empty: true,
        docs: []
      });

      // Act
      const result = await getAgentProfile(userId);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error when retrieval fails', async () => {
      // Arrange
      const userId = 'user123';

      (collection as any).mockReturnValue({});
      (query as any).mockReturnValue({});
      (where as any).mockReturnValue({});
      (getDocs as any).mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(getAgentProfile(userId)).rejects.toThrow(
        'Failed to retrieve agent profile. Please try again.'
      );
    });
  });
});
