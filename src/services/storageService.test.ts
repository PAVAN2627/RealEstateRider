/**
 * Storage Service Tests
 * 
 * Unit tests for Firebase Storage operations including file validation,
 * uploads, and deletion.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateFile,
  uploadPropertyImage,
  uploadAadharDocument,
  uploadAgentPhoto,
  deleteFile
} from './storageService';

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn()
}));

vi.mock('../config/firebase.config', () => ({
  storage: {}
}));

import { uploadBytes, getDownloadURL, deleteObject, ref } from 'firebase/storage';

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should validate file with correct type and size', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

      expect(() => validateFile(file, maxSize, allowedTypes)).not.toThrow();
    });

    it('should throw error for invalid file type', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

      expect(() => validateFile(file, maxSize, allowedTypes)).toThrow(
        'Invalid file type'
      );
    });

    it('should throw error for file exceeding size limit', () => {
      // Create a file larger than 5MB
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ['image/jpeg'];

      expect(() => validateFile(file, maxSize, allowedTypes)).toThrow(
        'File size exceeds'
      );
    });

    it('should accept PDF files for document uploads', () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

      expect(() => validateFile(file, maxSize, allowedTypes)).not.toThrow();
    });
  });

  describe('uploadPropertyImage', () => {
    it('should upload property image successfully', async () => {
      const file = new File(['content'], 'property.jpg', { type: 'image/jpeg' });
      const propertyId = 'prop123';
      const mockDownloadURL = 'https://storage.example.com/property-images/prop123/property.jpg';

      vi.mocked(ref).mockReturnValue({} as any);
      vi.mocked(uploadBytes).mockResolvedValue({ ref: {} } as any);
      vi.mocked(getDownloadURL).mockResolvedValue(mockDownloadURL);

      const result = await uploadPropertyImage(file, propertyId);

      expect(result).toBe(mockDownloadURL);
      expect(ref).toHaveBeenCalled();
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
    });

    it('should throw error for invalid image type', async () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const propertyId = 'prop123';

      await expect(uploadPropertyImage(file, propertyId)).rejects.toThrow(
        'Property image upload failed'
      );
    });

    it('should throw error for oversized image', async () => {
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const propertyId = 'prop123';

      await expect(uploadPropertyImage(file, propertyId)).rejects.toThrow(
        'Property image upload failed'
      );
    });
  });

  describe('uploadAadharDocument', () => {
    it('should upload Aadhar document (image) successfully', async () => {
      const file = new File(['content'], 'aadhar.jpg', { type: 'image/jpeg' });
      const userId = 'user123';
      const mockDownloadURL = 'https://storage.example.com/aadhar-documents/user123/aadhar.jpg';

      vi.mocked(ref).mockReturnValue({} as any);
      vi.mocked(uploadBytes).mockResolvedValue({ ref: {} } as any);
      vi.mocked(getDownloadURL).mockResolvedValue(mockDownloadURL);

      const result = await uploadAadharDocument(file, userId);

      expect(result).toBe(mockDownloadURL);
      expect(ref).toHaveBeenCalled();
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
    });

    it('should upload Aadhar document (PDF) successfully', async () => {
      const file = new File(['content'], 'aadhar.pdf', { type: 'application/pdf' });
      const userId = 'user123';
      const mockDownloadURL = 'https://storage.example.com/aadhar-documents/user123/aadhar.pdf';

      vi.mocked(ref).mockReturnValue({} as any);
      vi.mocked(uploadBytes).mockResolvedValue({ ref: {} } as any);
      vi.mocked(getDownloadURL).mockResolvedValue(mockDownloadURL);

      const result = await uploadAadharDocument(file, userId);

      expect(result).toBe(mockDownloadURL);
    });

    it('should throw error for invalid document type', async () => {
      const file = new File(['content'], 'document.txt', { type: 'text/plain' });
      const userId = 'user123';

      await expect(uploadAadharDocument(file, userId)).rejects.toThrow(
        'Aadhar document upload failed'
      );
    });
  });

  describe('uploadAgentPhoto', () => {
    it('should upload agent photo successfully', async () => {
      const file = new File(['content'], 'profile.jpg', { type: 'image/jpeg' });
      const agentId = 'agent123';
      const mockDownloadURL = 'https://storage.example.com/agent-photos/agent123/profile.jpg';

      vi.mocked(ref).mockReturnValue({} as any);
      vi.mocked(uploadBytes).mockResolvedValue({ ref: {} } as any);
      vi.mocked(getDownloadURL).mockResolvedValue(mockDownloadURL);

      const result = await uploadAgentPhoto(file, agentId);

      expect(result).toBe(mockDownloadURL);
      expect(ref).toHaveBeenCalled();
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
    });

    it('should throw error for non-image file', async () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const agentId = 'agent123';

      await expect(uploadAgentPhoto(file, agentId)).rejects.toThrow(
        'Agent photo upload failed'
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const fileUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/property-images%2Fprop123%2Fimage.jpg?alt=media&token=abc123';

      vi.mocked(ref).mockReturnValue({} as any);
      vi.mocked(deleteObject).mockResolvedValue(undefined);

      await expect(deleteFile(fileUrl)).resolves.not.toThrow();
      expect(ref).toHaveBeenCalled();
      expect(deleteObject).toHaveBeenCalled();
    });

    it('should throw error for invalid URL format', async () => {
      const invalidUrl = 'https://example.com/invalid-url';

      await expect(deleteFile(invalidUrl)).rejects.toThrow(
        'File deletion failed'
      );
    });

    it('should handle deletion errors', async () => {
      const fileUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/property-images%2Fprop123%2Fimage.jpg?alt=media&token=abc123';

      vi.mocked(ref).mockReturnValue({} as any);
      vi.mocked(deleteObject).mockRejectedValue(new Error('Storage error'));

      await expect(deleteFile(fileUrl)).rejects.toThrow(
        'File deletion failed'
      );
    });
  });
});
