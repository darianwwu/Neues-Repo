import type { Area } from 'react-easy-crop';

export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

export async function getCroppedPng(
  imageSrc: string,
  pixelCrop: Area,
  maxSize = 1080
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // crop size
  const cropW = pixelCrop.width;
  const cropH = pixelCrop.height;

  // downscale if needed
  const scale = Math.min(1, maxSize / Math.max(cropW, cropH));
  canvas.width = Math.round(cropW * scale);
  canvas.height = Math.round(cropH * scale);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    cropW,
    cropH,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Could not create image blob'));
        else resolve(blob);
      },
      'image/png'
    );
  });
}

// Legacy function for backward compatibility
export async function getCroppedJpeg(
  imageSrc: string,
  pixelCrop: Area,
  maxSize = 1080,
  quality = 0.85
): Promise<Blob> {
  return getCroppedPng(imageSrc, pixelCrop, maxSize);
}
