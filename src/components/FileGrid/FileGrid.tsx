import {
  Cross2Icon,
  MagnifyingGlassIcon,
  RotateCounterClockwiseIcon,
} from '@radix-ui/react-icons';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { ImgFile } from '../../types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface FileGridProps {
  files: ImgFile[];
  onRemove: (id: string) => void;
  onRotate: (id: string) => void;
}

export function FileGrid({ files, onRemove, onRotate }: FileGridProps) {
  const [previewItem, setPreviewItem] = useState<ImgFile | null>(null);

  const closePreview = useCallback(() => setPreviewItem(null), []);

  useEffect(() => {
    if (!previewItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewItem, closePreview]);

  useBodyScrollLock(Boolean(previewItem));

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-800/70 bg-slate-900/50 py-12 text-sm text-slate-400">
        Drop images to start building your grid.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {files.map((item) => (
        <div
          key={item.id}
          role="button"
          tabIndex={0}
          onClick={() => setPreviewItem(item)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' ||
              event.key === ' ' ||
              event.key === 'Space'
            ) {
              event.preventDefault();
              setPreviewItem(item);
            }
          }}
          aria-label={`Preview ${item.file.name}`}
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/70 shadow-inner transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="h-28 w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
            <MagnifyingGlassIcon className="h-7 w-7 text-slate-100 drop-shadow-lg" />
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRotate(item.id);
            }}
            className="absolute left-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-slate-900/90 text-slate-200 opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-violet-500"
            aria-label={`Rotate ${item.file.name}`}
          >
            <RotateCounterClockwiseIcon />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(item.id);
            }}
            className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-slate-900/90 text-slate-200 opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-red-500"
            aria-label={`Remove ${item.file.name}`}
          >
            <Cross2Icon />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2">
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-xs text-slate-200">
                {item.file.name}
              </p>
              {item.rotationQuarterTurns !== 0 && (
                <span className="ml-auto rounded bg-violet-600/90 px-1.5 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-violet-100">
                  {item.rotationQuarterTurns * 90}°
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      {previewItem &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Preview of ${previewItem.file.name}`}
            className="fixed inset-0 z-50 overflow-auto bg-black/80 backdrop-blur-sm"
          >
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <div className="relative w-full max-w-5xl">
                <button
                  type="button"
                  onClick={closePreview}
                  className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-slate-200 shadow-lg transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  aria-label="Close preview"
                >
                  <Cross2Icon />
                </button>
                <img
                  src={previewItem.previewUrl}
                  alt={previewItem.file.name}
                  className="h-auto w-full max-w-full rounded-2xl border border-slate-800/70 shadow-2xl"
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
