/**
 * Image Optimization Utility
 * 
 * Provides image compression, lazy loading, and responsive image utilities.
 * 
 * Requirements: 22.4, 22.7
 */

/**
 * Compresses an image file before upload
 * 
 * @param file - Image file to compress
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1080)
 * @param quality - Compression quality 0-1 (default: 0.8)
 * @returns Promise resolving to compressed file
 * 
 * Requirement 22.4: Compress images before upload
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Generates a thumbnail from an image file
 * 
 * @param file - Image file to create thumbnail from
 * @param size - Thumbnail size in pixels (default: 200)
 * @returns Promise resolving to thumbnail file
 */
export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<File> {
  return compressImage(file, size, size, 0.7);
}

/**
 * Lazy loads an image with intersection observer
 * 
 * @param imgElement - Image element to lazy load
 * @param src - Image source URL
 * @param placeholder - Placeholder image URL (optional)
 * 
 * Requirement 22.7: Implement lazy loading for images
 */
export function lazyLoadImage(
  imgElement: HTMLImageElement,
  src: string,
  placeholder?: string
): void {
  // Set placeholder if provided
  if (placeholder) {
    imgElement.src = placeholder;
  }
  
  // Create intersection observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = src;
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before image enters viewport
    }
  );
  
  observer.observe(imgElement);
}

/**
 * Gets responsive image sizes based on viewport width
 * 
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @returns Object with responsive sizes
 * 
 * Requirement 22.4: Use responsive image sizes
 */
export function getResponsiveImageSizes(
  originalWidth: number,
  originalHeight: number
): {
  mobile: { width: number; height: number };
  tablet: { width: number; height: number };
  desktop: { width: number; height: number };
} {
  const aspectRatio = originalWidth / originalHeight;
  
  return {
    mobile: {
      width: 640,
      height: Math.round(640 / aspectRatio),
    },
    tablet: {
      width: 1024,
      height: Math.round(1024 / aspectRatio),
    },
    desktop: {
      width: 1920,
      height: Math.round(1920 / aspectRatio),
    },
  };
}

/**
 * Preloads critical images
 * 
 * @param urls - Array of image URLs to preload
 */
export function preloadImages(urls: string[]): void {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Creates a blur placeholder for an image
 * 
 * @param width - Placeholder width
 * @param height - Placeholder height
 * @returns Data URL for blur placeholder
 */
export function createBlurPlaceholder(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }
  
  // Create gradient for placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f0f0f0');
  gradient.addColorStop(1, '#e0e0e0');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

/**
 * Validates image dimensions
 * 
 * @param file - Image file to validate
 * @param minWidth - Minimum width (optional)
 * @param minHeight - Minimum height (optional)
 * @param maxWidth - Maximum width (optional)
 * @param maxHeight - Maximum height (optional)
 * @returns Promise resolving to validation result
 */
export async function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<{ isValid: boolean; error?: string; width?: number; height?: number }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = img;
        
        if (minWidth && width < minWidth) {
          resolve({
            isValid: false,
            error: `Image width must be at least ${minWidth}px`,
            width,
            height,
          });
          return;
        }
        
        if (minHeight && height < minHeight) {
          resolve({
            isValid: false,
            error: `Image height must be at least ${minHeight}px`,
            width,
            height,
          });
          return;
        }
        
        if (maxWidth && width > maxWidth) {
          resolve({
            isValid: false,
            error: `Image width must not exceed ${maxWidth}px`,
            width,
            height,
          });
          return;
        }
        
        if (maxHeight && height > maxHeight) {
          resolve({
            isValid: false,
            error: `Image height must not exceed ${maxHeight}px`,
            width,
            height,
          });
          return;
        }
        
        resolve({ isValid: true, width, height });
      };
      
      img.onerror = () => {
        resolve({ isValid: false, error: 'Failed to load image' });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      resolve({ isValid: false, error: 'Failed to read file' });
    };
    
    reader.readAsDataURL(file);
  });
}
