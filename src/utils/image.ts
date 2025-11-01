function isHeicFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime.includes('heic') || mime.includes('heif')) return true;
  const name = (file.name || '').toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

export async function fileToImage(file: File): Promise<HTMLImageElement> {
  let blob: Blob = file;

  if (isHeicFile(file)) {
    const { default: heic2any } = await import('heic2any');
    const converted = (await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95,
    })) as Blob | Blob[];
    blob = Array.isArray(converted) ? converted[0] : converted;
  }

  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode();
  URL.revokeObjectURL(url);
  return img;
}

export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokePreviewUrls(files: Array<{ previewUrl: string }>): void {
  files.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  });
}
