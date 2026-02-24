import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Wishlist document structure
 */
interface WishlistDocument {
  id: string;
  userId: string;
  propertyIds: string[];
  updatedAt: Timestamp;
}

/**
 * Add a property to user's wishlist
 * Requirements: 8.1
 */
export async function addToWishlist(userId: string, propertyId: string): Promise<void> {
  try {
    const wishlistRef = doc(db, 'wishlists', userId);
    const wishlistDoc = await getDoc(wishlistRef);

    if (wishlistDoc.exists()) {
      // Update existing wishlist
      await updateDoc(wishlistRef, {
        propertyIds: arrayUnion(propertyId),
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new wishlist document
      await setDoc(wishlistRef, {
        id: userId,
        userId,
        propertyIds: [propertyId],
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw new Error('Failed to add property to wishlist');
  }
}

/**
 * Remove a property from user's wishlist
 * Requirements: 8.2
 */
export async function removeFromWishlist(userId: string, propertyId: string): Promise<void> {
  try {
    const wishlistRef = doc(db, 'wishlists', userId);
    
    await updateDoc(wishlistRef, {
      propertyIds: arrayRemove(propertyId),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw new Error('Failed to remove property from wishlist');
  }
}

/**
 * Get user's wishlist (array of property IDs)
 * Requirements: 8.3
 */
export async function getWishlist(userId: string): Promise<string[]> {
  try {
    const wishlistRef = doc(db, 'wishlists', userId);
    const wishlistDoc = await getDoc(wishlistRef);

    if (wishlistDoc.exists()) {
      const data = wishlistDoc.data() as WishlistDocument;
      return data.propertyIds || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw new Error('Failed to fetch wishlist');
  }
}

/**
 * Check if a property is in user's wishlist
 * Requirements: 8.4, 8.6
 */
export async function isPropertyWishlisted(userId: string, propertyId: string): Promise<boolean> {
  try {
    const wishlistRef = doc(db, 'wishlists', userId);
    const wishlistDoc = await getDoc(wishlistRef);

    if (wishlistDoc.exists()) {
      const data = wishlistDoc.data() as WishlistDocument;
      return data.propertyIds?.includes(propertyId) || false;
    }

    return false;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    throw new Error('Failed to check wishlist status');
  }
}

/**
 * Remove a property from all wishlists (used when property is deleted)
 * Requirements: 8.5
 */
export async function removePropertyFromAllWishlists(propertyId: string): Promise<void> {
  try {
    // Query all wishlists that contain this property
    const wishlistsRef = collection(db, 'wishlists');
    const q = query(wishlistsRef, where('propertyIds', 'array-contains', propertyId));
    
    const querySnapshot = await getDocs(q);
    
    // Remove the property from each wishlist
    const updatePromises = querySnapshot.docs.map(async (wishlistDoc) => {
      const wishlistRef = doc(db, 'wishlists', wishlistDoc.id);
      await updateDoc(wishlistRef, {
        propertyIds: arrayRemove(propertyId),
        updatedAt: Timestamp.now()
      });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error removing property from all wishlists:', error);
    throw new Error('Failed to remove property from wishlists');
  }
}
