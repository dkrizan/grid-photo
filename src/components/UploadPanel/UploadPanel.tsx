import { Button, Flex, Heading } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';

import { ImgFile, Notice } from '../../types';
import { FileDropzone } from '../Dropzone';
import { NoticePanel } from '../NoticePanel';
import { FileGrid } from '../FileGrid';

interface UploadPanelProps {
  files: ImgFile[];
  groupSize: number;
  notice: Notice | null;
  readyForPreview: boolean;
  readyForDownload: boolean;
  previewShortfall: number;
  downloadShortfall: number;
  onFilesSelected: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
}

export function UploadPanel({
  files,
  groupSize,
  notice,
  readyForPreview,
  readyForDownload,
  previewShortfall,
  downloadShortfall,
  onFilesSelected,
  onRemoveFile,
  onClearAll,
}: UploadPanelProps) {
  return (
    <Flex direction="column" gap="4">
      <FileDropzone
        fileCount={files.length}
        groupSize={groupSize}
        onFilesSelected={onFilesSelected}
      />

      <div className="flex flex-col gap-2">
        <NoticePanel
          notice={notice}
          hasFiles={files.length > 0}
          readyForPreview={readyForPreview}
          readyForDownload={readyForDownload}
          previewShortfall={previewShortfall}
          downloadShortfall={downloadShortfall}
        />
      </div>

      <div className="space-y-3">
        <Flex align="center" justify="between">
          <Heading as="h2" size="3" className="text-slate-200">
            Selected photos
          </Heading>
          {files.length > 0 && (
            <Button
              variant="ghost"
              color="gray"
              onClick={onClearAll}
              className="gap-2 cursor-pointer"
            >
              <TrashIcon />
              Clear all
            </Button>
          )}
        </Flex>

        <FileGrid files={files} onRemove={onRemoveFile} />
      </div>
    </Flex>
  );
}
