import { AspectRatio } from '../types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Validates image file format and size
 */
export const validateImage = (file: File): ValidationResult => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported format. Please use: ${validTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is 10MB. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  return { valid: true };
};

/**
 * Gets image dimensions from a file
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Calculates target dimensions for a given aspect ratio
 */
export const calculateTargetDimensions = (
  originalWidth: number,
  originalHeight: number,
  targetAspectRatio: AspectRatio
): { width: number; height: number } => {
  const [ratioW, ratioH] = targetAspectRatio.split(':').map(Number);
  const targetRatio = ratioW / ratioH;
  const originalRatio = originalWidth / originalHeight;

  let targetWidth: number;
  let targetHeight: number;

  if (originalRatio > targetRatio) {
    // Image is wider than target - fit to height
    targetHeight = originalHeight;
    targetWidth = Math.round(targetHeight * targetRatio);
  } else {
    // Image is taller than target - fit to width
    targetWidth = originalWidth;
    targetHeight = Math.round(targetWidth / targetRatio);
  }

  return { width: targetWidth, height: targetHeight };
};

/**
 * Resizes and crops an image to match the target aspect ratio
 */
export const resizeImageToAspectRatio = (
  file: File,
  aspectRatio: AspectRatio,
  quality: number = 0.9
): Promise<{ blob: Blob; dataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
      const targetRatio = ratioW / ratioH;
      const originalRatio = img.width / img.height;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      // Calculate crop area to match aspect ratio
      if (originalRatio > targetRatio) {
        // Image is wider - crop width
        sourceWidth = Math.round(img.height * targetRatio);
        sourceX = Math.round((img.width - sourceWidth) / 2);
      } else {
        // Image is taller - crop height
        sourceHeight = Math.round(img.width / targetRatio);
        sourceY = Math.round((img.height - sourceHeight) / 2);
      }

      // Calculate output dimensions (max 2048px on longest side for performance)
      const maxDimension = 2048;
      let outputWidth = sourceWidth;
      let outputHeight = sourceHeight;

      if (outputWidth > maxDimension || outputHeight > maxDimension) {
        if (outputWidth > outputHeight) {
          outputWidth = maxDimension;
          outputHeight = Math.round(maxDimension / targetRatio);
        } else {
          outputHeight = maxDimension;
          outputWidth = Math.round(maxDimension * targetRatio);
        }
      }

      // Create canvas and draw resized/cropped image
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw image with cropping and resizing
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, outputWidth, outputHeight
      );

      // Convert to blob and data URL
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          const dataUrl = canvas.toDataURL(file.type, quality);
          resolve({ blob, dataUrl });
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = url;
  });
};

/**
 * Processes an image file: validates and resizes to match aspect ratio
 */
export const processImage = async (
  file: File,
  aspectRatio: AspectRatio
): Promise<{ file: File; previewUrl: string; base64: string; mimeType: string }> => {
  // Validate first
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Image validation failed');
  }

  // Get original dimensions
  const originalDims = await getImageDimensions(file);

  // Resize to match aspect ratio
  const { blob, dataUrl } = await resizeImageToAspectRatio(file, aspectRatio);

  // Create a new File object from the blob
  const processedFile = new File([blob], file.name, {
    type: file.type,
    lastModified: Date.now(),
  });

  // Create preview URL
  const previewUrl = URL.createObjectURL(processedFile);

  return {
    file: processedFile,
    previewUrl,
    base64: dataUrl,
    mimeType: file.type,
  };
};

