/**
 * ImageUpload Component
 * 
 * Reusable image upload component with file validation, preview,
 * and progress indication. Supports multiple image uploads.
 * 
 * Requirements: 4.3, 4.4, 16.1, 16.2, 16.3
 */

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import ErrorMessage from './ErrorMessage';

/**
 * ImageUpload props
 */
interface ImageUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
  existingImages?: string[];
  onRemoveExisting?: (imageUrl: string) => void;
}

/**
 * ImageUpload Component
 * 
 * Provides file selection UI, validation, upload progress, and image preview.
 * Supports multiple image uploads with drag-and-drop functionality.
 * 
 * Requirements:
 * - 4.3: Validate each image file type and size (maximum 5MB per image)
 * - 4.4: Allow up to 10 images per Property
 * - 16.1: Validate file extension is in the allowed list
 * - 16.2: Reject upload and display error when file exceeds size limit
 * - 16.3: Display upload progress and success confirmation
 */
export default function ImageUpload({
  onUpload,
  maxFiles = 10,
  maxSizeMB = 5,
  accept = 'image/jpeg,image/jpg,image/png',
  multiple = true,
  existingImages = [],
  onRemoveExisting,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = accept.split(',').map(t => t.trim());
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    setError(null);
    const filesArray = Array.from(files);
    
    // Check total file count
    const totalFiles = existingImages.length + selectedFiles.length + filesArray.length;
    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed. You have ${existingImages.length} existing and ${selectedFiles.length} selected.`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of filesArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveSelected = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress (in real implementation, track actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Clear selected files after successful upload
      setTimeout(() => {
        setSelectedFiles([]);
        setPreviews([]);
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Existing Images ({existingImages.length})</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                {onRemoveExisting && (
                  <button
                    onClick={() => onRemoveExisting(imageUrl)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop images here, or click to select
        </p>
        <p className="text-xs text-gray-500">
          Maximum {maxFiles} images, {maxSizeMB}MB each
        </p>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Selected Images ({selectedFiles.length})</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSelected(index);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-center text-muted-foreground">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && !uploading && (
        <Button onClick={handleUpload} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Image' : 'Images'}
        </Button>
      )}
    </div>
  );
}
