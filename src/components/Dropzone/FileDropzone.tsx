import { Button, Text } from '@radix-ui/themes';
import { UploadIcon } from '@radix-ui/react-icons';
import { useId, useRef, useState } from 'react';

interface FileDropzoneProps {
  fileCount: number;
  groupSize: number;
  onFilesSelected: (files: FileList | File[]) => void;
}

export function FileDropzone({
  fileCount,
  groupSize,
  onFilesSelected,
}: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);

  const isFileDrag = (event: React.DragEvent<HTMLDivElement>) => {
    const items = event.dataTransfer?.items;
    if (items && items.length > 0) {
      return Array.from(items).some((item) => item.kind === 'file');
    }
    const types = event.dataTransfer?.types;
    return types ? Array.from(types).includes('Files') : false;
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragActive(false);
    if (event.dataTransfer.files) {
      onFilesSelected(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isFileDrag(event)) {
      setIsDragActive(true);
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isFileDrag(event)) {
      return;
    }
    dragCounter.current += 1;
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isFileDrag(event)) {
      return;
    }
    dragCounter.current = Math.max(dragCounter.current - 1, 0);
    if (dragCounter.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleBrowse = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      role="presentation"
      className={`relative flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center transition hover:border-violet-400/70 hover:bg-slate-900 cursor-pointer ${
        isDragActive
          ? 'border-violet-400/80 bg-slate-900/50 shadow-[0_0_0_4px_rgba(139,92,246,0.35)]'
          : 'border-slate-700/80 bg-slate-900/70'
      }`}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={handleBrowse}
        ref={inputRef}
        className="hidden"
      />
      <Button variant="soft" color="violet" asChild>
        <label
          htmlFor={inputId}
          className="flex items-center gap-2 text-base font-medium cursor-pointer"
        >
          <UploadIcon />
          Browse images
        </label>
      </Button>
      <Text size="2" className="text-slate-300">
        …or drag &amp; drop files here
      </Text>
      <Text
        size="1"
        className="rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-slate-400"
      >
        {fileCount} selected · {groupSize} per grid
      </Text>
    </div>
  );
}
