/**
 * Agent Profile Service
 * 
 * Provides Firestore operations for agent profile management including:
 * - Creating agent profiles
 * - Updating agent profile information
 * - Retrieving agent profiles by user ID
 * 
 * Requirements: 10.1, 10.2, 10.5
 */

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
import { db } from '../config/firebase.config';
import { AgentProfile } from '../types/user.types';

/**
 * Creates an agent profile document in Firestore
 * 
 * @param agentProfile - Agent profile object to create
 * @returns Promise that resolves when agent profile is created
 * @throws Error if agent profile creation fails
 * 
 * Requirement 10.1: Create agent profile with verification status pending
 */
export async function createAgentProfile(agentProfile: Omit<AgentProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentProfile> {
  try {
    // Generate a new document reference to get the ID
    const agentProfileRef = doc(collection(db, 'agentProfiles'));
    
    // Create the complete agent profile with timestamps
    const newAgentProfile: AgentProfile = {
      ...agentProfile,
      id: agentProfileRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Save agent profile document to Firestore
    await setDoc(agentProfileRef, newAgentProfile);

    return newAgentProfile;
  } catch (error: any) {
    console.error('Error creating agent profile:', error);
    throw new Error('Failed to create agent profile. Please try again.');
  }
}

/**
 * Updates an agent profile's information
 * 
 * @param agentId - The agent profile ID
 * @param profileData - Partial agent profile data to update
 * @returns Promise that resolves when profile is updated
 * @throws Error if update fails
 * 
 * Requirement 10.2: Allow agents to update profile fields
 */
export async function updateAgentProfile(
  agentId: string,
  profileData: Partial<Omit<AgentProfile, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    const agentProfileRef = doc(db, 'agentProfiles', agentId);
    
    // Check if agent profile exists
    const agentProfileSnap = await getDoc(agentProfileRef);
    if (!agentProfileSnap.exists()) {
      throw new Error('Agent profile not found');
    }

    // Update agent profile with new data and updated timestamp
    await updateDoc(agentProfileRef, {
      ...profileData,
      updatedAt: Timestamp.now()
    });
  } catch (error: any) {
    console.error('Error updating agent profile:', error);
    throw new Error(`Failed to update agent profile. ${error.message}`);
  }
}

/**
 * Retrieves an agent profile by user ID
 * 
 * @param userId - The user's UID
 * @returns Promise that resolves to the AgentProfile object or null if not found
 * @throws Error if retrieval fails
 * 
 * Requirement 10.5: Display agent profile information
 */
export async function getAgentProfile(userId: string): Promise<AgentProfile | null> {
  try {
    const agentProfilesRef = collection(db, 'agentProfiles');
    const q = query(agentProfilesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Return the first matching agent profile
    const agentProfileDoc = querySnapshot.docs[0];
    return agentProfileDoc.data() as AgentProfile;
  } catch (error: any) {
    console.error('Error getting agent profile:', error);
    throw new Error('Failed to retrieve agent profile. Please try again.');
  }
}
