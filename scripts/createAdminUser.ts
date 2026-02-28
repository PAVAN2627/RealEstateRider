/**
 * Create Admin User Script
 * 
 * This script creates the first admin user in the system with APPROVED status.
 * Run this script once to bootstrap the platform with an admin account.
 * 
 * Usage:
 *   npm run create-admin
 * 
 * The script will prompt for:
 *   - Admin email
 *   - Admin password
 *   - Admin name
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Firebase configuration (loaded from environment variables)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('\n❌ Error: Firebase configuration is missing!');
  console.error('Please ensure your .env file has all required Firebase variables:');
  console.error('  - VITE_FIREBASE_API_KEY');
  console.error('  - VITE_FIREBASE_AUTH_DOMAIN');
  console.error('  - VITE_FIREBASE_PROJECT_ID');
  console.error('  - VITE_FIREBASE_STORAGE_BUCKET');
  console.error('  - VITE_FIREBASE_MESSAGING_SENDER_ID');
  console.error('  - VITE_FIREBASE_APP_ID\n');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdminUser() {
  try {
    console.log('\n=== EstateSphere Admin User Creation ===\n');

    // Get admin details from user input
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 6 characters): ');
    const name = await question('Enter admin name: ');

    // Validate inputs
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    console.log('\nCreating admin user...');

    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    console.log('✓ Firebase Auth account created');

    // Create user document in Firestore with APPROVED status
    const adminUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role: 'admin',
      verificationStatus: 'approved', // Pre-approved admin
      createdAt: Timestamp.now(),
      profile: {
        name: name,
        phone: '0000000000', // Default phone for admin
      },
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), adminUser);

    console.log('✓ Admin user document created in Firestore');
    console.log('\n=== Admin User Created Successfully! ===');
    console.log(`Email: ${email}`);
    console.log(`UID: ${firebaseUser.uid}`);
    console.log(`Status: APPROVED`);
    console.log('\nYou can now login with these credentials.\n');

    rl.close();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating admin user:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdminUser();
