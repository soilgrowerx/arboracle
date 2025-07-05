'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Image as ImageIcon, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploadProps {
  initialImages?: string[]; // Array of base64 encoded image strings
  onImagesChange: (images: string[]) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  initialImages = [],
  onImagesChange,
}) => {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(initialImages);

  useEffect(() => {
    if (JSON.stringify(images) !== JSON.stringify(initialImages)) {
      setImages(initialImages);
    }
  }, [initialImages]); // Removed images from dependency to prevent infinite loop

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              newImages.push(reader.result);
              if (newImages.length === files.length) {
                const updatedImages = [...images, ...newImages];
                setImages(updatedImages);
                onImagesChange(updatedImages);
              }
            }
          };
          reader.readAsDataURL(file);
        } else {
          toast({
            title: "Invalid File Type",
            description: "Only image files are supported.",
            variant: "destructive",
          });
        }
      });
    }
  }, [images, onImagesChange, toast]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">Upload Images</Label>
      <div className="flex gap-2">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden" // Hide the default input
        />
        <Button
          type="button"
          onClick={() => document.getElementById('image-upload')?.click()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ImageIcon size={18} /> Select from Gallery
        </Button>
        {/* Future: Camera integration */}
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2"
          disabled // Placeholder for camera functionality
        >
          <Camera size={18} /> Take Photo
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {images.map((image, index) => (
          <div key={index} className="relative group aspect-square rounded-md overflow-hidden shadow-md">
            <img src={image} alt={`Uploaded ${index}`} className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => handleRemoveImage(index)}
            >
              <XCircle size={20} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
