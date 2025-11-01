import { Button, Text } from '@radix-ui/themes';
import { UploadIcon } from '@radix-ui/react-icons';
import { useId } from 'react';

interface FileDropzoneProps {
  fileCount: number;
  groupSize: number;
  onFilesSelected: (files: FileList | File[]) => void;
}

export function FileDropzone({ fileCount, groupSize, onFilesSelected }: FileDropzoneProps) {
  const inputId = useId();

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      onFilesSelected(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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
      className="relative flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/70 p-6 text-center transition hover:border-violet-400/70 hover:bg-slate-900"
    >
      <input id={inputId} type="file" accept="image/*" multiple onChange={handleBrowse} className="hidden" />
      <Button variant="soft" color="violet" asChild>
        <label htmlFor={inputId} className="flex cursor-pointer items-center gap-2 text-base font-medium">
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
