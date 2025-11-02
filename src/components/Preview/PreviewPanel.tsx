import { Heading, Text } from '@radix-ui/themes';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { ComposeOptions, ImgFile } from '../../types';
import { PreviewCanvas } from './PreviewCanvas';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface PreviewPanelProps {
  groups: ImgFile[][];
  options: ComposeOptions;
  ready: boolean;
  outputWidthPx: number;
  outputHeightPx: number;
}

export function PreviewPanel({
  groups,
  options,
  ready,
  outputWidthPx,
  outputHeightPx,
}: PreviewPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalGroups = groups.length;

  const canExpand = ready && totalGroups > 0 && outputWidthPx > 0;
  const safeIndex =
    totalGroups > 0 ? Math.min(activeIndex, totalGroups - 1) : 0;
  const activeGroup = totalGroups > 0 ? groups[safeIndex] : undefined;

  const closeExpanded = useCallback(() => setIsExpanded(false), []);

  const handlePrev = useCallback(() => {
    if (totalGroups === 0) return;
    setActiveIndex((prev) => (prev - 1 + totalGroups) % totalGroups);
  }, [totalGroups]);

  const handleNext = useCallback(() => {
    if (totalGroups === 0) return;
    setActiveIndex((prev) => (prev + 1) % totalGroups);
  }, [totalGroups]);

  useEffect(() => {
    if (!isExpanded || !canExpand) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeExpanded();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, canExpand, closeExpanded, handlePrev, handleNext]);

  useEffect(() => {
    if (!canExpand && isExpanded) {
      const handle = requestAnimationFrame(() => setIsExpanded(false));
      return () => cancelAnimationFrame(handle);
    }
    return;
  }, [canExpand, isExpanded]);

  const interactiveProps = useMemo<HTMLAttributes<HTMLDivElement>>(() => {
    if (!canExpand) return {};
    return {
      role: 'button',
      tabIndex: 0,
      'aria-label': 'Expand live preview',
      onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (
          event.key === 'Enter' ||
          event.key === ' ' ||
          event.key === 'Space'
        ) {
          event.preventDefault();
          setIsExpanded(true);
        }
      },
      onClick: () => {
        setIsExpanded(true);
      },
    };
  }, [canExpand, setIsExpanded]);

  useBodyScrollLock(isExpanded && canExpand);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Heading as="h2" size="3" className="text-slate-200">
          Live grid preview
        </Heading>
        <Text size="2" className="text-slate-400">
          {outputWidthPx} × {outputHeightPx} px
        </Text>
      </div>
      <div
        {...interactiveProps}
        className={`group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60 ${
          canExpand
            ? 'cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
            : ''
        }`}
      >
        <PreviewCanvas
          group={activeGroup}
          options={options}
          ready={ready}
          className="h-auto w-full"
        />
        {canExpand && (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
              <MagnifyingGlassIcon className="h-8 w-8 text-slate-100 drop-shadow-lg" />
            </div>
            {totalGroups > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-slate-200 shadow-lg transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 group-hover:flex group-focus-within:flex"
                  aria-label="Previous preview"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-slate-200 shadow-lg transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 group-hover:flex group-focus-within:flex"
                  aria-label="Next preview"
                >
                  <ChevronRightIcon />
                </button>
                <div className="pointer-events-none absolute bottom-3 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-slate-100 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  {safeIndex + 1} / {totalGroups}
                </div>
              </>
            )}
          </>
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
          >
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <div className="relative w-full max-w-6xl">
                <button
                  type="button"
                  onClick={closeExpanded}
                  className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-slate-200 shadow-lg transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  aria-label="Close expanded preview"
                >
                  <Cross2Icon />
                </button>
                {totalGroups > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePrev();
                      }}
                      className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-slate-100 shadow-2xl transition hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                      aria-label="Previous preview"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleNext();
                      }}
                      className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-slate-100 shadow-2xl transition hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                      aria-label="Next preview"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                    <div className="pointer-events-none absolute bottom-4 right-6 rounded-full bg-black/60 px-4 py-1.5 text-sm font-medium text-slate-100">
                      {safeIndex + 1} / {totalGroups}
                    </div>
                  </>
                )}
                <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60">
                  <PreviewCanvas
                    group={activeGroup}
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
