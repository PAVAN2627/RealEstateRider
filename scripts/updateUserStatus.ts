/**
 * Update User Verification Status Script
 * 
 * Updates a user's verification status in Firestore.
 * Useful for fixing users created before the auto-approval logic.
 */

import * as admin from 'firebase-admin';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Firebase Admin
const serviceAccount = require('../realestaterider-9c3ee-firebase-adminsdk-fbsvc-a1dd93958f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function updateUserStatus() {
  try {
    console.log('\n=== Update User Verification Status ===\n');

    const email = await question('Enter user email: ');
    const status = await question('Enter new status (approved/pending/rejected/suspended): ');

    if (!['approved', 'pending', 'rejected', 'suspended'].includes(status)) {
      console.error('Invalid status. Must be: approved, pending, rejected, or suspended');
      process.exit(1);
    }

    // Find user by email
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();

    if (usersSnapshot.empty) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    // Update user status
    await db.collection('users').doc(userId).update({
      verificationStatus: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`\n✅ Successfully updated user status to: ${status}`);
    console.log(`User ID: ${userId}`);
    console.log(`Email: ${email}`);

  } catch (error) {
    console.error('Error updating user status:', error);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

updateUserStatus();
