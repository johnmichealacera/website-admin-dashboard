# WebP Optimization Example

This example demonstrates how to use the WebP optimization feature in your application.

## Basic Usage

### 1. Single Image Upload with WebP Optimization

```typescript
import { uploadToCloudinary } from '@/lib/utils/cloudinary-upload';

// Basic upload with automatic WebP optimization
const handleImageUpload = async (file: File) => {
  try {
    const result = await uploadToCloudinary(file, {
      cloudinaryUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
      enableWebPOptimization: true,
      showOptimizationInfo: true
    });

    console.log('Upload successful:', result.url);
    
    // Check optimization results
    if (result.optimizationInfo) {
      console.log(`File size reduced by ${result.optimizationInfo.savingsPercentage.toFixed(1)}%`);
      console.log(`Original: ${result.optimizationInfo.originalSize} bytes`);
      console.log(`Optimized: ${result.optimizationInfo.optimizedSize} bytes`);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### 2. Multiple Images Upload with Batch Optimization

```typescript
import { uploadMultipleToCloudinary } from '@/lib/utils/cloudinary-upload';

// Batch upload with WebP optimization
const handleMultipleImageUpload = async (files: File[]) => {
  try {
    const results = await uploadMultipleToCloudinary(files, {
      cloudinaryUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
      enableWebPOptimization: true,
      showOptimizationInfo: true
    });

    const urls = results.map(result => result.url);
    console.log('All uploads successful:', urls);
  } catch (error) {
    console.error('Batch upload failed:', error);
  }
};
```

### 3. Custom Optimization Settings

```typescript
import { uploadToCloudinary } from '@/lib/utils/cloudinary-upload';

// Custom optimization settings
const handleCustomOptimization = async (file: File) => {
  try {
    const result = await uploadToCloudinary(file, {
      cloudinaryUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
      enableWebPOptimization: true,
      optimizationOptions: {
        quality: 90,           // High quality
        maxWidth: 1920,        // Max width
        maxHeight: 1080,       // Max height
        preserveMetadata: false // Don't preserve EXIF
      },
      showOptimizationInfo: true
    });

    console.log('Custom optimization complete:', result.url);
  } catch (error) {
    console.error('Custom optimization failed:', error);
  }
};
```

## React Component Integration

### 4. Form Component with Optimization Status

```tsx
import { useState } from 'react';
import { uploadToCloudinary } from '@/lib/utils/cloudinary-upload';
import { OptimizationStatus } from '@/components/ui/optimization-status';

export function ImageUploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const result = await uploadToCloudinary(file, {
        cloudinaryUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
        enableWebPOptimization: true,
        showOptimizationInfo: true
      });

      setUploadedUrl(result.url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Upload Image</label>
        <OptimizationStatus showDetails={true} />
      </div>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      {isUploading && (
        <div className="text-sm text-gray-600">
          Uploading and optimizing image...
        </div>
      )}
      
      {uploadedUrl && (
        <div className="text-sm text-green-600">
          Upload successful! URL: {uploadedUrl}
        </div>
      )}
    </div>
  );
}
```

## Browser Compatibility Check

### 5. Check WebP Support

```typescript
import { isWebPSupported, getOptimizationStatus } from '@/lib/utils/cloudinary-upload';

// Check if WebP is supported
const webpSupported = isWebPSupported();
console.log('WebP supported:', webpSupported);

// Get detailed status
const status = getOptimizationStatus();
console.log('Optimization status:', status);
// Output: { supported: true, recommended: true, message: 'WebP optimization is available and recommended' }
```

## Error Handling

### 6. Graceful Fallback

```typescript
import { uploadToCloudinary } from '@/lib/utils/cloudinary-upload';

const handleUploadWithFallback = async (file: File) => {
  try {
    // Try with WebP optimization first
    const result = await uploadToCloudinary(file, {
      cloudinaryUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
      enableWebPOptimization: true
    });

    return result.url;
  } catch (error) {
    console.warn('WebP optimization failed, trying without optimization:', error);
    
    // Fallback to original format
    try {
      const result = await uploadToCloudinary(file, {
        cloudinaryUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
        enableWebPOptimization: false
      });

      return result.url;
    } catch (fallbackError) {
      console.error('Upload failed completely:', fallbackError);
      throw fallbackError;
    }
  }
};
```

## Performance Monitoring

### 7. Track Optimization Results

```typescript
import { uploadToCloudinary } from '@/lib/utils/cloudinary-upload';
import { formatFileSize } from '@/lib/utils/image-optimization';

const trackOptimizationPerformance = async (file: File) => {
  const startTime = performance.now();
  
  const result = await uploadToCloudinary(file, {
    cloudinaryUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
    enableWebPOptimization: true,
    showOptimizationInfo: true
  });

  const endTime = performance.now();
  const processingTime = endTime - startTime;

  console.log('Performance metrics:', {
    processingTime: `${processingTime.toFixed(2)}ms`,
    originalSize: formatFileSize(result.originalFile.size),
    optimizedSize: result.optimizationInfo ? formatFileSize(result.optimizationInfo.optimizedSize) : 'N/A',
    savings: result.optimizationInfo ? `${result.optimizationInfo.savingsPercentage.toFixed(1)}%` : 'N/A'
  });
};
```

## Expected Results

When using WebP optimization, you should see:

1. **Console logs** showing optimization results:
   ```
   Image optimization: 2.5 MB → 1.2 MB (52.0% smaller)
   ```

2. **Smaller file sizes** in Cloudinary storage

3. **Faster upload times** due to reduced file sizes

4. **Visual indicators** in the UI showing optimization status

5. **Graceful fallback** if WebP is not supported

## Troubleshooting

If you encounter issues:

1. **Check browser console** for error messages
2. **Verify WebP support** using `isWebPSupported()`
3. **Test with different file types** (JPEG, PNG, etc.)
4. **Check file size limits** and Cloudinary configuration
5. **Review network connectivity** and Cloudinary credentials 