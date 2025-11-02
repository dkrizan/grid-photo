import { Heading, Text } from '@radix-ui/themes';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

import { ComposeOptions, ImgFile } from '../../types';
import { PreviewCanvas } from './PreviewCanvas';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface PreviewPanelProps {
  group?: ImgFile[];
  options: ComposeOptions;
  ready: boolean;
  outputWidthPx: number;
  outputHeightPx: number;
}

export function PreviewPanel({
  group,
  options,
  ready,
  outputWidthPx,
  outputHeightPx,
}: PreviewPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expectedCount = useMemo(
    () => options.rows * options.cols,
    [options.rows, options.cols]
  );
  const canExpand =
    ready && !!group && group.length >= expectedCount && outputWidthPx > 0;

  const closeExpanded = useCallback(() => setIsExpanded(false), []);

  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeExpanded();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, closeExpanded]);

  useBodyScrollLock(isExpanded && canExpand);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Heading as="h2" size="3" className="text-slate-200">
          Live preview
        </Heading>
        <Text size="2" className="text-slate-400">
          {outputWidthPx} × {outputHeightPx} px
        </Text>
      </div>
      <div
        {...(canExpand
          ? {
              role: 'button' as const,
              tabIndex: 0,
              'aria-label': 'Expand live preview',
              onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                if (
                  event.key === 'Enter' ||
                  event.key === ' ' ||
                  event.key === 'Space'
                ) {
                  event.preventDefault();
                  setIsExpanded(true);
                }
              },
            }
          : {})}
        onClick={() => {
          if (canExpand) setIsExpanded(true);
        }}
        className={`group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60 ${
          canExpand
            ? 'cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
            : ''
        }`}
      >
        <PreviewCanvas
          group={group}
          options={options}
          ready={ready}
          className="h-auto w-full"
        />
        {canExpand && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
            <MagnifyingGlassIcon className="h-8 w-8 text-slate-100 drop-shadow-lg" />
          </div>
        )}
      </div>
      {isExpanded &&
        canExpand &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Expanded live preview"
            className="fixed inset-0 z-50 overflow-auto bg-black/85 backdrop-blur-sm"
            onClick={closeExpanded}
          >
            <div
              className="flex min-h-full items-center justify-center px-4 py-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative w-full max-w-6xl">
                <button
                  type="button"
                  onClick={closeExpanded}
                  className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-slate-200 shadow-lg transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  aria-label="Close expanded preview"
                >
                  <Cross2Icon />
                </button>
                <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60">
                  <PreviewCanvas
                    group={group}
                    options={options}
                    ready={ready}
                    maxWidth={1920}
                    maxHeight={1440}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
