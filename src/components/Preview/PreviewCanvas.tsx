import { useEffect, useRef } from 'react';

import { ComposeOptions, ImgFile } from '../../types';
import { createGridCanvas, fileToImage } from '../../utils';

interface PreviewCanvasProps {
  group?: ImgFile[];
  options: ComposeOptions;
  ready: boolean;
}

export function PreviewCanvas({ group, options, ready }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const expected = options.rows * options.cols;

      const primeCanvas = () => {
        canvas.width = 480;
        canvas.height = 360;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#020617');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        ctx.setLineDash([]);
      };

      if (!ready || !group || group.length < expected) {
        primeCanvas();
        return;
      }

      primeCanvas();
      await Promise.all(
        group.map(async (item) => {
          if (!item.img) item.img = await fileToImage(item.file);
        }),
      );

      if (cancelled) return;

      const gridCanvas = createGridCanvas(
        group.map((item) => item.img!),
        options,
      );
      if (cancelled) return;

      const srcWidth = gridCanvas.width || 1;
      const srcHeight = gridCanvas.height || 1;
      const maxWidth = 480;
      const maxHeight = 360;
      const scale = Math.min(maxWidth / srcWidth, maxHeight / srcHeight, 1);
      const drawWidth = Math.max(1, Math.round(srcWidth * scale));
      const drawHeight = Math.max(1, Math.round(srcHeight * scale));
      canvas.width = Math.max(320, drawWidth);
      canvas.height = Math.max(240, drawHeight);
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const offsetX = Math.round((canvas.width - drawWidth) / 2);
      const offsetY = Math.round((canvas.height - drawHeight) / 2);
      ctx.drawImage(gridCanvas, offsetX, offsetY, drawWidth, drawHeight);
    };

    render().catch((error) => {
      console.error(error);
    });

    return () => {
      cancelled = true;
    };
  }, [group, options, ready]);

  return <canvas ref={canvasRef} className="h-auto w-full" />;
}
