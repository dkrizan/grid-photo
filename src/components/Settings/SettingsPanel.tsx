import { Flex } from '@radix-ui/themes';

import { ComposeOptions, ImgFile, NumericInputMap } from '../../types';
import { ActionButtons } from '../Actions';
import { PreviewPanel } from '../Preview';
import { CompositionSettings, NumericFieldHandlers } from './CompositionSettings';

interface SettingsPanelProps {
  options: ComposeOptions;
  inputValues: NumericInputMap;
  numericHelpers: NumericFieldHandlers;
  groupSize: number;
  outputWidthPx: number;
  outputHeightPx: number;
  previewGroup?: ImgFile[];
  readyForPreview: boolean;
  busy: boolean;
  readyForDownload: boolean;
  singleFileResult: boolean;
  totalFiles: number;
  onOptionsChange: (patch: Partial<ComposeOptions>) => void;
  onDownload: () => Promise<void> | void;
  onReset: () => void;
}

export function SettingsPanel({
  options,
  inputValues,
  numericHelpers,
  groupSize,
  outputWidthPx,
  outputHeightPx,
  previewGroup,
  readyForPreview,
  busy,
  readyForDownload,
  singleFileResult,
  totalFiles,
  onOptionsChange,
  onDownload,
  onReset,
}: SettingsPanelProps) {
  return (
    <Flex direction="column" gap="5">
      <CompositionSettings
        options={options}
        inputValues={inputValues}
        numericHelpers={numericHelpers}
        groupSize={groupSize}
        outputWidthPx={outputWidthPx}
        outputHeightPx={outputHeightPx}
        onOptionsChange={onOptionsChange}
      />

      <PreviewPanel
        group={previewGroup}
        options={options}
        ready={readyForPreview}
        outputWidthPx={outputWidthPx}
        outputHeightPx={outputHeightPx}
      />

      <ActionButtons
        busy={busy}
        readyForDownload={readyForDownload}
        singleFileResult={singleFileResult}
        totalFiles={totalFiles}
        onDownload={onDownload}
        onReset={onReset}
      />
    </Flex>
  );
}
