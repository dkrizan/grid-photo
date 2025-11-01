import { Cross2Icon } from '@radix-ui/react-icons';

import { ImgFile } from '../../types';

interface FileGridProps {
  files: ImgFile[];
  onRemove: (id: string) => void;
}

export function FileGrid({ files, onRemove }: FileGridProps) {
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
          className="group relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/70 shadow-inner"
        >
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="h-28 w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-slate-900/90 text-slate-200 opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-red-500"
            aria-label={`Remove ${item.file.name}`}
          >
            <Cross2Icon />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2">
            <p className="truncate text-xs text-slate-200">{item.file.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
