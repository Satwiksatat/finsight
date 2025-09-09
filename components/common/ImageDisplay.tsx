// components/common/ImageDisplay.tsx
import React from 'react';
import Image from 'next/image';
import { ImageContent } from '@/lib/types';

interface ImageDisplayProps {
  imageData: ImageContent;
}

export function ImageDisplay({ imageData }: ImageDisplayProps) {
  if (!imageData || !imageData.url || imageData.url.trim() === '') {
    return <div className="text-red-500">Invalid image data provided.</div>;
  }

  return (
    <div className="my-4 text-center">
      <Image
        src={imageData.url}
        alt={imageData.alt || 'Generated image'}
        width={700} // Max width, will be constrained by parent
        height={400} // Max height, adjust ratio based on common image output
        layout="responsive" // Makes image responsive within its parent container
        objectFit="contain" // Ensures the image fits without cropping
        className="rounded-lg shadow-md"
      />
      {imageData.alt && <p className="text-sm text-muted-foreground mt-2">{imageData.alt}</p>}
    </div>
  );
}