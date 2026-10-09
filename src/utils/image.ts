// Uploaded photos are stored in Firestore, which caps a document at 1 MiB, so photos
// are downscaled and re-encoded as JPEG in the browser before they are sent.
const MAX_BYTES = 900_000;

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image'));
    };
    img.src = url;
  });

const encode = (img: HTMLImageElement, maxSide: number, quality: number): string => {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process that image');
  // JPEG has no transparency; paint white so transparent PNGs do not turn black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
};

// Base64 encodes 3 bytes as 4 characters.
const byteSize = (dataUrl: string) => Math.ceil(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4);

export async function fileToCompressedDataUrl(file: File): Promise<string> {
  const img = await loadImage(file);
  let maxSide = 1600;
  let quality = 0.82;
  let dataUrl = encode(img, maxSide, quality);
  while (byteSize(dataUrl) > MAX_BYTES && maxSide > 480) {
    maxSide = Math.round(maxSide * 0.75);
    quality = Math.max(0.5, quality - 0.08);
    dataUrl = encode(img, maxSide, quality);
  }
  return dataUrl;
}
