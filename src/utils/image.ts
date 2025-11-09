const KNOWN_IMAGE_EXTENSIONS = [
  '.avif',
  '.bmp',
  '.gif',
  '.heic',
  '.heif',
  '.jpeg',
  '.jpg',
  '.png',
  '.tif',
  '.tiff',
  '.webp',
];

function isHeicFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime.includes('heic') || mime.includes('heif')) return true;
  const name = (file.name || '').toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

function inferHeicMime(file: File): string {
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.heif')) {
    return 'image/heif';
  }
  return 'image/heic';
}

export function isSupportedImageFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime.startsWith('image/')) return true;
  const name = (file.name || '').toLowerCase();
  return KNOWN_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

async function waitForImageLoad(img: HTMLImageElement): Promise<void> {
  if (typeof img.decode === 'function') {
    try {
      await img.decode();
      return;
    } catch {
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        return;
      }
    }
  }

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      img.onload = null;
      img.onerror = null;
      resolve();
    };
    img.onerror = () => {
      img.onload = null;
      img.onerror = null;
      reject(new Error('Failed to load image'));
    };
  });
}

async function decodeBlobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  try {
    await waitForImageLoad(img);
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

let heicConverterPromise: Promise<typeof import('heic2any')> | null = null;
const heicConversionCache = new WeakMap<File, Blob>();

async function convertHeicToJpeg(file: File): Promise<Blob> {
  const cached = heicConversionCache.get(file);
  if (cached) {
    return cached;
  }

  if (!heicConverterPromise) {
    heicConverterPromise = import('heic2any');
  }
  const { default: heic2any } = await heicConverterPromise;
  const sourceBlob =
    file.type && file.type.toLowerCase().includes('hei')
      ? file
      : file.slice(0, file.size || 0, inferHeicMime(file));
  const converted = (await heic2any({
    blob: sourceBlob,
    toType: 'image/jpeg',
    quality: 0.95,
  })) as Blob | Blob[];
  const normalized = Array.isArray(converted) ? converted[0] : converted;
  heicConversionCache.set(file, normalized);
  return normalized;
}

export async function fileToImage(file: File): Promise<HTMLImageElement> {
  const cachedHeic = heicConversionCache.get(file);
  if (cachedHeic) {
    return await decodeBlobToImage(cachedHeic);
  }

  try {
    return await decodeBlobToImage(file);
  } catch (error) {
    if (!isHeicFile(file)) {
      throw error;
    }
  }

  const convertedBlob = await convertHeicToJpeg(file);
  return await decodeBlobToImage(convertedBlob);
}

export async function createPreviewUrl(file: File): Promise<string> {
  if (isHeicFile(file)) {
    try {
      const convertedBlob = await convertHeicToJpeg(file);
      return URL.createObjectURL(convertedBlob);
    } catch {
      // fall back to the raw file if conversion fails
    }
  }
  return URL.createObjectURL(file);
}

export function revokePreviewUrls(files: Array<{ previewUrl: string }>): void {
  files.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  });
}
