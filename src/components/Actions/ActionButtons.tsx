import { Button, Flex } from '@radix-ui/themes';
import { DownloadIcon, TrashIcon } from '@radix-ui/react-icons';

interface ActionButtonsProps {
  busy: boolean;
  readyForDownload: boolean;
  singleFileResult: boolean;
  totalFiles: number;
  onDownload: () => Promise<void> | void;
  onReset: () => void;
}

export function ActionButtons({
  busy,
  readyForDownload,
  singleFileResult,
  totalFiles,
  onDownload,
  onReset,
}: ActionButtonsProps) {
  return (
    <Flex gap="3" wrap="wrap">
      <Button
        onClick={onDownload}
        disabled={busy || !readyForDownload}
        className="gap-2 cursor-pointer bg-violet-600 text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-400"
      >
        <DownloadIcon />
        {busy ? 'Processing…' : singleFileResult ? 'Download' : 'Download all (zip)'}
      </Button>
      <Button
        variant="surface"
        color="gray"
        onClick={onReset}
        disabled={totalFiles === 0}
        className="gap-2 cursor-pointer"
      >
        <TrashIcon />
        Reset
      </Button>
    </Flex>
  );
}
