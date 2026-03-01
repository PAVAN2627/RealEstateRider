/**
 * Storage Service
 * 
 * Provides file upload and validation for property images, Aadhar documents, and agent photos.
 * 
 * NOTE: This version uses Base64 encoding to store images directly in Firestore
 * since Firebase Storage is not enabled. For production with many images,
 * consider using a dedicated image hosting service like Cloudinary or ImgBB.
 * 
 * Requirements: 3.2, 3.3, 4.3, 4.4, 16.1, 16.2, 16.3, 16.5, 16.6
 */

/**
 * Allowed file types for uploads
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_DOCUMENT_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate file type and size
 * 
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes
 * @param allowedTypes - Array of allowed MIME types
 * @returns boolean - True if file is valid, false otherwise
 * @throws Error with validation message if file is invalid
 * 
 * Requirements 16.1, 16.2, 16.3: Validate file extension, size, and reject invalid files
 */
export function validateFile(
  file: File,
  maxSize: number,
  allowedTypes: string[]
): boolean {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    throw new Error(
      `File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    );
  }

  return true;
}

/**
 * Sanitize filename to remove special characters
 * 
 * @param filename - Original filename
 * @returns string - Sanitized filename
 * 
 * Requirement 16.5: Sanitize uploaded filenames
 */
function sanitizeFilename(filename: string): string {
  // Remove special characters and replace spaces with underscores
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\s+/g, '_');
}

/**
 * Generate unique filename with timestamp
 * 
 * @param originalFilename - Original filename
 * @returns string - Unique filename
 * 
 * Requirement 16.6: Generate unique identifiers for stored files
 */
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sanitized = sanitizeFilename(originalFilename);
  const extension = sanitized.split('.').pop();
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
  
  return `${nameWithoutExt}_${timestamp}_${randomString}.${extension}`;
}

/**
 * Convert image file to Base64 string (Firestore-only solution)
 * 
 * @param file - Image file to convert
 * @returns Promise<string> - Base64 data URL
 * @throws Error if conversion fails
 */
function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to Base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image to reduce size before storing in Firestore
 * 
 * @param base64Image - Base64 image string
 * @param maxWidth - Maximum width in pixels
 * @param quality - JPEG quality (0-1)
 * @returns Promise<string> - Compressed Base64 image
 */
function compressImage(base64Image: string, maxWidth: number = 800, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64Image;
  });
}

/**
 * Upload property image (Firestore-only version using Base64)
 * 
 * NOTE: This stores images as Base64 in Firestore since Firebase Storage is not enabled.
 * For production, consider using a dedicated image hosting service like Cloudinary.
 * 
 * @param file - Image file to upload
 * @param propertyId - Property ID for organizing storage (not used in Base64 version)
 * @returns Promise<string> - Base64 data URL
 * @throws Error if validation or conversion fails
 * 
 * Requirements 4.3, 4.4, 16.7: Upload property images with validation and return data URL
 */
export async function uploadPropertyImage(
  file: File,
  propertyId: string
): Promise<string> {
  try {
    // Validate file (use smaller max size for Base64 storage)
    const MAX_BASE64_SIZE = 500 * 1024; // 500KB for Base64 (will be compressed)
    validateFile(file, MAX_BASE64_SIZE, ALLOWED_IMAGE_TYPES);

    // Convert to Base64
    const base64Image = await convertImageToBase64(file);
    
    // Compress image to reduce Firestore storage
    const compressedImage = await compressImage(base64Image, 800, 0.7);
    
    return compressedImage;
  } catch (error: any) {
    throw new Error(`Property image upload failed: ${error.message}`);
  }
}

/**
 * Upload Aadhar document (Firestore-only version using Base64)
 * 
 * NOTE: This stores documents as Base64 in Firestore since Firebase Storage is not enabled.
 * 
 * @param file - Aadhar document file to upload (image or PDF)
 * @param userId - User ID for organizing storage (not used in Base64 version)
 * @returns Promise<string> - Base64 data URL
 * @throws Error if validation or conversion fails
 * 
 * Requirements 3.2, 3.3, 16.7: Upload Aadhar document with validation and return data URL
 */
export async function uploadAadharDocument(
  file: File,
  userId: string
): Promise<string> {
  try {
    // Validate file (use smaller max size for Base64 storage)
    const MAX_BASE64_SIZE = 500 * 1024; // 500KB
    validateFile(file, MAX_BASE64_SIZE, ALLOWED_DOCUMENT_TYPES);

    // Convert to Base64
    const base64Document = await convertImageToBase64(file);
    
    // If it's an image, compress it
    if (file.type.startsWith('image/')) {
      const compressedImage = await compressImage(base64Document, 800, 0.7);
      return compressedImage;
    }
    
    return base64Document;
  } catch (error: any) {
    throw new Error(`Aadhar document upload failed: ${error.message}`);
  }
}

/**
 * Upload agent profile photo (Firestore-only version using Base64)
 * 
 * NOTE: This stores photos as Base64 in Firestore since Firebase Storage is not enabled.
 * 
 * @param file - Profile photo file to upload
 * @param agentId - Agent ID for organizing storage (not used in Base64 version)
 * @returns Promise<string> - Base64 data URL
 * @throws Error if validation or conversion fails
 * 
 * Requirements 16.1, 16.2, 16.3, 16.7: Upload agent photo with validation and return data URL
 */
export async function uploadAgentPhoto(
  file: File,
  agentId: string
): Promise<string> {
  try {
    // Validate file (use smaller max size for Base64 storage)
    const MAX_BASE64_SIZE = 300 * 1024; // 300KB for profile photos
    validateFile(file, MAX_BASE64_SIZE, ALLOWED_IMAGE_TYPES);

    // Convert to Base64
    const base64Image = await convertImageToBase64(file);
    
    // Compress image (smaller size for profile photos)
    const compressedImage = await compressImage(base64Image, 400, 0.8);

    return compressedImage;
  } catch (error: any) {
    throw new Error(`Agent photo upload failed: ${error.message}`);
  }
}

/**
 * Upload selfie photo for user verification (Firestore-only version using Base64)
 * 
 * NOTE: This stores photos as Base64 in Firestore since Firebase Storage is not enabled.
 * 
 * @param file - Selfie photo file to upload
 * @param userId - User ID for organizing storage (not used in Base64 version)
 * @returns Promise<string> - Base64 data URL
 * @throws Error if validation or conversion fails
 * 
 * Requirements: Upload selfie photo with validation and return data URL
 */
export async function uploadSelfiePhoto(
  file: File,
  userId: string
): Promise<string> {
  try {
    // Validate file (use smaller max size for Base64 storage)
    const MAX_BASE64_SIZE = 500 * 1024; // 500KB for selfie photos
    validateFile(file, MAX_BASE64_SIZE, ALLOWED_IMAGE_TYPES);

    // Convert to Base64
    const base64Image = await convertImageToBase64(file);
    
    // Compress image
    const compressedImage = await compressImage(base64Image, 800, 0.7);

    return compressedImage;
  } catch (error: any) {
    throw new Error(`Selfie photo upload failed: ${error.message}`);
  }
}

/**
 * Delete file (No-op for Base64 version)
 * 
 * @param fileUrl - Base64 data URL (not used)
 * @returns Promise<void>
 * 
 * NOTE: For Base64 storage, deletion is handled by removing the property/document from Firestore
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  // No-op for Base64 storage - files are deleted when the parent document is deleted
  return Promise.resolve();
}
