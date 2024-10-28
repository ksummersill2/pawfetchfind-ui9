import { useState } from 'react';
import { uploadImage, deleteImage, ImageBucket } from '../lib/supabaseClient';

interface UseImageUploadOptions {
  bucket: ImageBucket;
  maxSizeMB?: number;
  quality?: number;
  folder?: string;
}

export const useImageUpload = (options: UseImageUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string> => {
    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadImage(file, options.bucket, {
        maxSizeMB: options.maxSizeMB,
        quality: options.quality,
        folder: options.folder
      });
      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const remove = async (path: string): Promise<void> => {
    setError(null);
    try {
      await deleteImage(path, options.bucket);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete image';
      setError(message);
      throw err;
    }
  };

  return {
    upload,
    remove,
    isUploading,
    error,
    clearError: () => setError(null)
  };
};

export default useImageUpload;