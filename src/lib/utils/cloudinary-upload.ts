/**
 * Enhanced Cloudinary upload utilities with WebP optimization
 * Combines the existing @jmacera/cloudinary-image-upload package with
 * client-side WebP conversion for better performance.
 */

import { handleFileChange } from "@jmacera/cloudinary-image-upload";
import { 
  convertToWebP, 
  optimizeImages, 
  isWebPSupported, 
  getRecommendedOptions,
  formatFileSize,
  calculateTotalSavings,
  type ImageOptimizationOptions
} from './image-optimization';

export interface CloudinaryUploadOptions {
  cloudinaryUrl: string;
  uploadPreset: string;
  apiKey: string;
  enableWebPOptimization?: boolean;
  optimizationOptions?: ImageOptimizationOptions;
  showOptimizationInfo?: boolean;
}

export interface CloudinaryUploadResult {
  url: string;
  originalFile: File;
  optimizedFile?: File;
  optimizationInfo?: {
    originalSize: number;
    optimizedSize: number;
    savings: number;
    savingsPercentage: number;
    format: string;
  };
}

/**
 * Enhanced file upload to Cloudinary with optional WebP optimization
 */
export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  const {
    cloudinaryUrl,
    uploadPreset,
    apiKey,
    enableWebPOptimization = true,
    optimizationOptions,
    showOptimizationInfo = false
  } = options;

  let optimizedFile: File | undefined;
  let optimizationInfo: CloudinaryUploadResult['optimizationInfo'];

  // Check if WebP optimization should be applied
  if (enableWebPOptimization && isWebPSupported()) {
    try {
      // Get recommended options if none provided
      const finalOptions = optimizationOptions || getRecommendedOptions(file);
      
      // Convert to WebP
      const result = await convertToWebP(file, finalOptions);
      optimizedFile = result.file;
      
      if (showOptimizationInfo) {
        optimizationInfo = {
          originalSize: result.originalSize,
          optimizedSize: result.optimizedSize,
          savings: result.originalSize - result.optimizedSize,
          savingsPercentage: ((result.originalSize - result.optimizedSize) / result.originalSize) * 100,
          format: result.format
        };
      }
    } catch (error) {
      console.warn('WebP optimization failed, falling back to original file:', error);
      optimizedFile = file;
    }
  } else {
    optimizedFile = file;
  }

  // Upload to Cloudinary using the optimized file
  const uploadedUrl = await handleFileChange(cloudinaryUrl, uploadPreset, apiKey, optimizedFile);

  if (!uploadedUrl || uploadedUrl.trim() === '') {
    throw new Error('Failed to upload image to Cloudinary');
  }

  return {
    url: uploadedUrl,
    originalFile: file,
    optimizedFile,
    optimizationInfo
  };
}

/**
 * Upload multiple files to Cloudinary with WebP optimization
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult[]> {
  const {
    cloudinaryUrl,
    uploadPreset,
    apiKey,
    enableWebPOptimization = true,
    optimizationOptions,
    showOptimizationInfo = false
  } = options;

  const results: CloudinaryUploadResult[] = [];

  if (enableWebPOptimization && isWebPSupported()) {
    try {
      // Optimize all images first
      const finalOptions = optimizationOptions || getRecommendedOptions(files[0]);
      const optimizedResults = await optimizeImages(files, finalOptions);
      
      if (showOptimizationInfo) {
        const totalSavings = calculateTotalSavings(optimizedResults);
        console.log(`Batch optimization: ${formatFileSize(totalSavings.originalTotal)} → ${formatFileSize(totalSavings.optimizedTotal)} (${totalSavings.savingsPercentage.toFixed(1)}% smaller)`);
      }

      // Upload optimized files
      for (let i = 0; i < files.length; i++) {
        const originalFile = files[i];
        const optimizedResult = optimizedResults[i];
        
        const uploadedUrl = await handleFileChange(cloudinaryUrl, uploadPreset, apiKey, optimizedResult.file);
        
        if (uploadedUrl && uploadedUrl.trim() !== '') {
          results.push({
            url: uploadedUrl,
            originalFile,
            optimizedFile: optimizedResult.file,
            optimizationInfo: showOptimizationInfo ? {
              originalSize: optimizedResult.originalSize,
              optimizedSize: optimizedResult.optimizedSize,
              savings: optimizedResult.originalSize - optimizedResult.optimizedSize,
              savingsPercentage: ((optimizedResult.originalSize - optimizedResult.optimizedSize) / optimizedResult.originalSize) * 100,
              format: optimizedResult.format
            } : undefined
          });
        }
      }
    } catch (error) {
      console.warn('Batch WebP optimization failed, falling back to individual uploads:', error);
      // Fallback to individual uploads without optimization
      for (const file of files) {
        const result = await uploadToCloudinary(file, { ...options, enableWebPOptimization: false });
        results.push(result);
      }
    }
  } else {
    // Upload without optimization
    for (const file of files) {
      const result = await uploadToCloudinary(file, { ...options, enableWebPOptimization: false });
      results.push(result);
    }
  }

  return results;
}

/**
 * Check if the current environment supports WebP optimization
 */
export function canOptimizeImages(): boolean {
  return typeof window !== 'undefined' && isWebPSupported();
}

/**
 * Get optimization status and recommendations
 */
export function getOptimizationStatus(): {
  supported: boolean;
  recommended: boolean;
  message: string;
} {
  const supported = canOptimizeImages();
  
  if (!supported) {
    return {
      supported: false,
      recommended: false,
      message: 'WebP optimization not supported in this browser'
    };
  }

  return {
    supported: true,
    recommended: true,
    message: 'WebP optimization is available and recommended'
  };
} 