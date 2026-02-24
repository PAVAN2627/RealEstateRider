/**
 * Script to update existing users' names from their email
 * Run this once to fix existing users who don't have names
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Firebase configuration (same as in firebase.config.ts)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateUserNames() {
  try {
    console.log('Starting to update user names...');
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let updated = 0;
    let skipped = 0;
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Check if user has no name or empty name
      if (!userData.profile?.name || userData.profile.name.trim() === '') {
        // Extract name from email (part before @)
        const emailUsername = userData.email.split('@')[0];
        // Capitalize first letter and replace dots/underscores with spaces
        const generatedName = emailUsername
          .replace(/[._]/g, ' ')
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Update user document
        await updateDoc(doc(db, 'users', userId), {
          'profile.name': generatedName
        });
        
        console.log(`Updated user ${userId}: ${userData.email} -> ${generatedName}`);
        updated++;
      } else {
        console.log(`Skipped user ${userId}: already has name "${userData.profile.name}"`);
        skipped++;
      }
    }
    
    console.log(`\nUpdate complete!`);
    console.log(`Updated: ${updated} users`);
    console.log(`Skipped: ${skipped} users`);
  } catch (error) {
    console.error('Error updating user names:', error);
  }
}

updateUserNames();
