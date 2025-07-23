/**
 * Image optimization utilities for converting images to WebP format
 * before uploading to Cloudinary for better performance and smaller file sizes.
 */

export interface ImageOptimizationOptions {
  quality?: number; // WebP quality (0-100), default: 80
  maxWidth?: number; // Maximum width in pixels, maintains aspect ratio
  maxHeight?: number; // Maximum height in pixels, maintains aspect ratio
}

export interface OptimizedImageResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
}

/**
 * Converts an image file to WebP format with optimization
 */
export async function convertToWebP(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    quality = 80,
    maxWidth,
    maxHeight
  } = options;

  return new Promise((resolve, reject) => {
    // Check if the file is already WebP
    if (file.type === 'image/webp') {
      resolve({
        file,
        originalSize: file.size,
        optimizedSize: file.size,
        compressionRatio: 1,
        format: 'webp'
      });
      return;
    }

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw the image on canvas (this will resize it)
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image to WebP'));
              return;
            }

            // Create a new file with WebP extension
            const webpFile = new File([blob], 
              file.name.replace(/\.[^/.]+$/, '.webp'), 
              { type: 'image/webp' }
            );

            const originalSize = file.size;
            const optimizedSize = webpFile.size;
            const compressionRatio = originalSize > 0 ? optimizedSize / originalSize : 1;

            resolve({
              file: webpFile,
              originalSize,
              optimizedSize,
              compressionRatio,
              format: 'webp'
            });
          },
          'image/webp',
          quality / 100
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image from the file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Optimizes multiple images to WebP format
 */
export async function optimizeImages(
  files: File[],
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult[]> {
  const results: OptimizedImageResult[] = [];
  
  for (const file of files) {
    try {
      const result = await convertToWebP(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to optimize image ${file.name}:`, error);
      // Fallback to original file if optimization fails
      results.push({
        file,
        originalSize: file.size,
        optimizedSize: file.size,
        compressionRatio: 1,
        format: file.type
      });
    }
  }
  
  return results;
}

/**
 * Validates if WebP is supported in the current browser
 */
export function isWebPSupported(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
}

/**
 * Gets recommended optimization settings based on image type and size
 */
export function getRecommendedOptions(file: File): ImageOptimizationOptions {
  const fileSizeMB = file.size / (1024 * 1024);
  
  // For very large images, be more aggressive with compression
  if (fileSizeMB > 5) {
    return {
      quality: 70,
      maxWidth: 1920,
      maxHeight: 1080
    };
  }
  
  // For medium images, balanced approach
  if (fileSizeMB > 1) {
    return {
      quality: 80,
      maxWidth: 2048,
      maxHeight: 2048
    };
  }
  
  // For small images, preserve quality
  return {
    quality: 85,
    maxWidth: 4096,
    maxHeight: 4096
  };
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculates total size savings from optimization
 */
export function calculateTotalSavings(results: OptimizedImageResult[]): {
  originalTotal: number;
  optimizedTotal: number;
  savings: number;
  savingsPercentage: number;
} {
  const originalTotal = results.reduce((sum, result) => sum + result.originalSize, 0);
  const optimizedTotal = results.reduce((sum, result) => sum + result.optimizedSize, 0);
  const savings = originalTotal - optimizedTotal;
  const savingsPercentage = originalTotal > 0 ? (savings / originalTotal) * 100 : 0;
  
  return {
    originalTotal,
    optimizedTotal,
    savings,
    savingsPercentage
  };
} 