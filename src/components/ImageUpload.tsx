'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

interface ImagePreview {
  file: File;
  url: string;
}

export function ImageUpload({ onImagesChange, maxImages = 3 }: ImageUploadProps) {
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: ImagePreview[] = [];
    const imageFiles: File[] = [];

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && imagePreviews.length + newImages.length < maxImages) {
        const url = URL.createObjectURL(file);
        newImages.push({ file, url });
        imageFiles.push(file);
      }
    });

    const updatedPreviews = [...imagePreviews, ...newImages];
    setImagePreviews(updatedPreviews);
    
    const allFiles = updatedPreviews.map(preview => preview.file);
    onImagesChange(allFiles);
  };

  const removeImage = (index: number) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);
    
    // Clean up object URL
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index].url);
    }
    
    const allFiles = updatedPreviews.map(preview => preview.file);
    onImagesChange(allFiles);
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={openCamera}
          variant="outline"
          className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          disabled={imagePreviews.length >= maxImages}
        >
          <Camera className="w-4 h-4 mr-2" />
          📷 Take Photo
        </Button>
        
        <Button
          type="button"
          onClick={openGallery}
          variant="outline"
          className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          disabled={imagePreviews.length >= maxImages}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          🖼️ Choose from Gallery
        </Button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleImageSelect(e.target.files)}
      />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleImageSelect(e.target.files)}
      />

      {/* Image previews */}
      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg border border-green-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {imagePreviews.length > 0 && (
        <p className="text-sm text-gray-600">
          {imagePreviews.length} of {maxImages} images selected
        </p>
      )}
    </div>
  );
}