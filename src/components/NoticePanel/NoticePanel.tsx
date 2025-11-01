import { Callout } from '@radix-ui/themes';
import { ImageIcon } from '@radix-ui/react-icons';

import { Notice } from '../../types';

interface NoticePanelProps {
  notice: Notice | null;
  hasFiles: boolean;
  readyForPreview: boolean;
  readyForDownload: boolean;
  previewShortfall: number;
  downloadShortfall: number;
}

const colorMap: Record<Notice['type'], 'red' | 'amber' | 'green' | 'blue'> = {
  error: 'red',
  warning: 'amber',
  success: 'green',
  info: 'blue',
};

export function NoticePanel({
  notice,
  hasFiles,
  readyForPreview,
  readyForDownload,
  previewShortfall,
  downloadShortfall,
}: NoticePanelProps) {
  if (notice) {
    return (
      <Callout.Root color={colorMap[notice.type]}>
        <Callout.Icon>
          <ImageIcon />
        </Callout.Icon>
        <Callout.Text>{notice.text}</Callout.Text>
      </Callout.Root>
    );
  }

  if (!hasFiles) return null;

  if (!readyForPreview) {
    return (
      <Callout.Root color="amber">
        <Callout.Icon>
          <ImageIcon />
        </Callout.Icon>
        <Callout.Text>
          Add {previewShortfall} more photo{previewShortfall === 1 ? '' : 's'}{' '}
          to render the first grid preview.
        </Callout.Text>
      </Callout.Root>
    );
  }

  if (!readyForDownload) {
    return (
      <Callout.Root color="amber">
        <Callout.Icon>
          <ImageIcon />
        </Callout.Icon>
        <Callout.Text>
          Add {downloadShortfall} more photo{downloadShortfall === 1 ? '' : 's'}{' '}
          to complete the next export batch.
        </Callout.Text>
      </Callout.Root>
    );
  }

  return null;
}
