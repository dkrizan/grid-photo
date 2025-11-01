import { Heading, Text } from '@radix-ui/themes';

import { ComposeOptions, ImgFile } from '../../types';
import { PreviewCanvas } from './PreviewCanvas';

interface PreviewPanelProps {
  group?: ImgFile[];
  options: ComposeOptions;
  ready: boolean;
  outputWidthPx: number;
  outputHeightPx: number;
}

export function PreviewPanel({ group, options, ready, outputWidthPx, outputHeightPx }: PreviewPanelProps) {
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
      <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60">
        <PreviewCanvas group={group} options={options} ready={ready} />
      </div>
    </div>
  );
}
