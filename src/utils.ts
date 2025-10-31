export type ComposeOptions = {
  rotate90: boolean;
  gapPx: number;
  separatorColor: string;
  output: 'image/jpeg' | 'image/png';
  quality: number;
  rows: number;
  cols: number;
  widthCm: number;
  heightCm: number;
  dpi: number;
  cropToFill?: boolean;
};

function isHeicFile(file: File) {
  const mime = (file.type || '').toLowerCase();
  if (mime.includes('heic') || mime.includes('heif')) return true;
  const name = (file.name || '').toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

export async function fileToImage(file: File): Promise<HTMLImageElement> {
  let blob: Blob = file;

  if (isHeicFile(file)) {
    const { default: heic2any } = await import('heic2any');
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95,
    }) as Blob | Blob[];
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

function dims(img: {width:number; height:number}, rotate: boolean) {
  const w = img.width, h = img.height;
  return rotate ? { w: h, h: w } : { w, h };
}

function drawImageRotated(ctx: CanvasRenderingContext2D, img: CanvasImageSource, rotate: boolean, dx: number, dy: number, dw: number, dh: number) {
  if (!rotate) {
    // @ts-ignore
    ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);
    return;
  }
  ctx.save();
  ctx.translate(dx, dy);
  ctx.translate(0, dh);
  ctx.rotate(-Math.PI/2);
  // @ts-ignore
  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, dh, dw);
  ctx.restore();
}

function clampPositive(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function createGridCanvas(
  images: HTMLImageElement[],
  opts: ComposeOptions
): HTMLCanvasElement {
  const { rotate90, gapPx, separatorColor, rows, cols, widthCm, heightCm, dpi, cropToFill } = opts;
  const expected = rows * cols;
  if (images.length !== expected) {
    throw new Error(`composeGrid requires exactly ${expected} images, received ${images.length}.`);
  }

  const safeWidthCm = clampPositive(widthCm, 15);
  const safeHeightCm = clampPositive(heightCm, 10);
  const safeDpi = clampPositive(dpi, 300);
  const outW = Math.max(8, Math.round((safeWidthCm / 2.54) * safeDpi));
  const outH = Math.max(8, Math.round((safeHeightCm / 2.54) * safeDpi));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = separatorColor;
  ctx.fillRect(0, 0, outW, outH);

  const dimsList = images.map((img) => dims(img, rotate90));
  const totalGapX = Math.max(0, cols - 1) * gapPx;
  const totalGapY = Math.max(0, rows - 1) * gapPx;
  const usableWidth = outW - totalGapX;
  const usableHeight = outH - totalGapY;
  if (usableWidth <= 0 || usableHeight <= 0) {
    throw new Error('Output size is too small for the selected layout. Increase the dimensions or reduce the gap.');
  }
  const cellW = usableWidth / cols;
  const cellH = usableHeight / rows;

  const shouldCrop = Boolean(cropToFill);

  images.forEach((img, idx) => {
    const d = dimsList[idx];
    const scale = shouldCrop ? Math.max(cellW / d.w, cellH / d.h) : Math.min(cellW / d.w, cellH / d.h);
    const targetW = Math.max(1, Math.round(d.w * scale));
    const targetH = Math.max(1, Math.round(d.h * scale));
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const baseX = col * (cellW + gapPx);
    const baseY = row * (cellH + gapPx);
    const clipLeft = Math.round(baseX);
    const clipTop = Math.round(baseY);
    const clipRight = Math.round(baseX + cellW);
    const clipBottom = Math.round(baseY + cellH);
    const clipWidth = Math.max(1, clipRight - clipLeft);
    const clipHeight = Math.max(1, clipBottom - clipTop);

    if (shouldCrop) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(clipLeft, clipTop, clipWidth, clipHeight);
      ctx.clip();
    }

    const dx = Math.round(clipLeft + (clipWidth - targetW) / 2);
    const dy = Math.round(clipTop + (clipHeight - targetH) / 2);
    drawImageRotated(ctx, img, rotate90, dx, dy, targetW, targetH);

    if (shouldCrop) {
      ctx.restore();
    }
  });

  return canvas;
}

export async function composeGrid(
  images: HTMLImageElement[],
  opts: ComposeOptions
): Promise<Blob> {
  const { output, quality } = opts;
  const canvas = createGridCanvas(images, opts);

  const blob: Blob = await new Promise((resolve) => {
    if (output === 'image/png') {
      canvas.toBlob((b)=>resolve(b!), 'image/png');
    } else {
      canvas.toBlob((b)=>resolve(b!), 'image/jpeg', quality);
    }
  });
  return blob;
}
