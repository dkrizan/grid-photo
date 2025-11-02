import { ComposeOptions } from '../types';

function clampPositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizedTurns(turns: number): number {
  const value = Number.isFinite(turns) ? Math.trunc(turns) : 0;
  return ((value % 4) + 4) % 4;
}

function dims(img: { width: number; height: number }, quarterTurns: number) {
  const { width, height } = img;
  const turns = normalizedTurns(quarterTurns);
  return turns % 2 === 1 ? { w: height, h: width } : { w: width, h: height };
}

function drawImageRotated(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  quarterTurns: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const turns = normalizedTurns(quarterTurns);
  const source = img as HTMLImageElement & { width: number; height: number };

  if (turns === 0) {
    ctx.drawImage(source, 0, 0, source.width, source.height, dx, dy, dw, dh);
    return;
  }

  if (turns === 1) {
    ctx.save();
    ctx.translate(dx, dy + dh);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, dh, dw);
    ctx.restore();
    return;
  }

  if (turns === 2) {
    ctx.save();
    ctx.translate(dx + dw, dy + dh);
    ctx.rotate(Math.PI);
    ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, dw, dh);
    ctx.restore();
    return;
  }

  // turns === 3
  ctx.save();
  ctx.translate(dx + dw, dy);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, dh, dw);
  ctx.restore();
}

export interface GridFrame {
  image: HTMLImageElement;
  rotationQuarterTurns?: number;
}

export function createGridCanvas(frames: GridFrame[], opts: ComposeOptions): HTMLCanvasElement {
  const { gapPx, separatorColor, rows, cols, widthCm, heightCm, dpi, cropToFill } = opts;
  const expected = rows * cols;
  if (frames.length !== expected) {
    throw new Error(`composeGrid requires exactly ${expected} images, received ${frames.length}.`);
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

  const dimsList = frames.map(({ image, rotationQuarterTurns }) => dims(image, rotationQuarterTurns ?? 0));
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

  frames.forEach((frame, idx) => {
    const img = frame.image;
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
    drawImageRotated(ctx, img, frame.rotationQuarterTurns ?? 0, dx, dy, targetW, targetH);

    if (shouldCrop) {
      ctx.restore();
    }
  });

  return canvas;
}

export async function composeGrid(frames: GridFrame[], opts: ComposeOptions): Promise<Blob> {
  const { output, quality } = opts;
  const canvas = createGridCanvas(frames, opts);

  return await new Promise((resolve) => {
    if (output === 'image/png') {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    } else {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality);
    }
  });
}
