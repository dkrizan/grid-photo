import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';

import { DEFAULT_OPTIONS } from '../constants/options';
import {
  composeGrid,
  createPreviewUrl,
  describeError,
  fileToImage,
  revokePreviewUrls,
  triggerFileDownload,
} from '../utils';
import { useGridOptions } from './useGridOptions';
import { ImgFile, Notice } from '../types';
import { ComposeOptions } from '../types';

export function useGridBuilder(
  defaultOptions: ComposeOptions = DEFAULT_OPTIONS
) {
  const { options, inputValues, numericHelpers, updateOptions } =
    useGridOptions(defaultOptions);
  const [files, setFiles] = useState<ImgFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const filesRef = useRef<ImgFile[]>([]);

  const addFiles = useCallback((list: FileList | File[]) => {
    const imgs = Array.from(list).filter((file) =>
      file.type.startsWith('image/')
    );
    if (!imgs.length) return;
    setFiles((prev) => [
      ...prev,
      ...imgs.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: createPreviewUrl(file),
        rotationQuarterTurns: 0,
      })),
    ]);
    setNotice(null);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
    setNotice(null);
  }, []);

  const clearFiles = useCallback(() => {
    revokePreviewUrls(files);
    setFiles([]);
    setNotice(null);
  }, [files]);

  const cycleFileRotation = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              rotationQuarterTurns: (item.rotationQuarterTurns + 1) % 4,
            }
          : item
      )
    );
  }, []);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      revokePreviewUrls(filesRef.current);
    };
  }, []);

  const groupSize = useMemo(
    () => Math.max(1, options.rows * options.cols),
    [options.cols, options.rows]
  );
  const remainder = useMemo(
    () => files.length % groupSize,
    [files.length, groupSize]
  );
  const previewGroups = useMemo<ImgFile[][]>(() => {
    if (files.length < groupSize) return [];
    const groups: ImgFile[][] = [];
    for (let index = 0; index + groupSize <= files.length; index += groupSize) {
      groups.push(files.slice(index, index + groupSize));
    }
    return groups;
  }, [files, groupSize]);

  const outputWidthPx = useMemo(
    () => Math.round(Math.max(8, (options.widthCm / 2.54) * options.dpi)),
    [options.widthCm, options.dpi]
  );
  const outputHeightPx = useMemo(
    () => Math.round(Math.max(8, (options.heightCm / 2.54) * options.dpi)),
    [options.heightCm, options.dpi]
  );

  const readyForPreview = previewGroups.length > 0;
  const readyForDownload = files.length >= groupSize && remainder === 0;
  const previewShortfall = Math.max(0, groupSize - files.length);
  const downloadShortfall = remainder === 0 ? 0 : groupSize - remainder;
  const singleFileResult = files.length <= groupSize;

  const ensureImages = useCallback(async (frames: ImgFile[]) => {
    await Promise.all(
      frames.map(async (item) => {
        if (!item.img) {
          item.img = await fileToImage(item.file);
        }
      })
    );
  }, []);

  const download = useCallback(async () => {
    if (files.length < groupSize) {
      setNotice({
        type: 'warning',
        text: `Please add at least ${groupSize} photo${groupSize === 1 ? '' : 's'} before exporting.`,
      });
      return;
    }

    if (remainder !== 0) {
      const missing = groupSize - remainder;
      setNotice({
        type: 'warning',
        text: `Add ${missing} more photo${missing === 1 ? '' : 's'} to complete the next grid.`,
      });
      return;
    }

    setBusy(true);

    try {
      const groups: ImgFile[][] = [];
      for (let i = 0; i < files.length; i += groupSize) {
        const segment = files.slice(i, i + groupSize);
        if (segment.length === groupSize) groups.push(segment);
      }

      await ensureImages(groups.flat());

      if (groups.length === 1) {
        try {
          const blob = await composeGrid(
            groups[0].map((item) => ({
              image: item.img!,
              rotationQuarterTurns: item.rotationQuarterTurns,
            })),
            options
          );
          const extension = options.output === 'image/png' ? 'png' : 'jpg';
          triggerFileDownload(blob, `grid.${extension}`);
          setNotice({ type: 'success', text: 'Exported 1 grid image.' });
        } catch (err) {
          setNotice({ type: 'error', text: describeError(err) });
        }
        return;
      }

      const zip = new JSZip();
      let index = 1;
      for (const group of groups) {
        try {
          const blob = await composeGrid(
            group.map((item) => ({
              image: item.img!,
              rotationQuarterTurns: item.rotationQuarterTurns,
            })),
            options
          );
          const extension = options.output === 'image/png' ? 'png' : 'jpg';
          const name = `grid-${String(index).padStart(2, '0')}.${extension}`;
          zip.file(name, blob);
          index += 1;
        } catch (err) {
          setNotice({ type: 'error', text: describeError(err) });
          return;
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      triggerFileDownload(zipBlob, 'photo-grids.zip');
      setNotice({
        type: 'success',
        text: `Exported ${files.length / groupSize} grids as a ZIP.`,
      });
    } finally {
      setBusy(false);
    }
  }, [ensureImages, files, groupSize, options, remainder]);

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    cycleFileRotation,
    options,
    updateOptions,
    inputValues,
    numericHelpers,
    busy,
    notice,
    setNotice,
    groupSize,
    readyForPreview,
    readyForDownload,
    previewShortfall,
    downloadShortfall,
    singleFileResult,
    outputWidthPx,
    outputHeightPx,
    previewGroups,
    download,
  };
}
