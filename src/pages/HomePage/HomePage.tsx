import { Card } from '@radix-ui/themes';

import { SettingsPanel } from '../../components/Settings';
import { UploadPanel } from '../../components/UploadPanel';
import { useGridBuilderContext } from '../../context/GridBuilderContext';

export function HomePage() {
  const {
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
    groupSize,
    readyForPreview,
    readyForDownload,
    previewShortfall,
    downloadShortfall,
    singleFileResult,
    outputWidthPx,
    outputHeightPx,
    firstGroup,
    download,
  } = useGridBuilderContext();

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <Card className="border border-slate-800/70 bg-slate-900/60 p-4 sm:p-6">
        <UploadPanel
          files={files}
          groupSize={groupSize}
          notice={notice}
          readyForPreview={readyForPreview}
          readyForDownload={readyForDownload}
          previewShortfall={previewShortfall}
          downloadShortfall={downloadShortfall}
          onFilesSelected={addFiles}
          onRemoveFile={removeFile}
          onRotateFile={cycleFileRotation}
          onClearAll={clearFiles}
        />
      </Card>

      <Card className="border border-slate-800/70 bg-slate-900/60 p-4 sm:p-6">
        <SettingsPanel
          options={options}
          inputValues={inputValues}
          numericHelpers={numericHelpers}
          groupSize={groupSize}
          outputWidthPx={outputWidthPx}
          outputHeightPx={outputHeightPx}
          previewGroup={firstGroup}
          readyForPreview={readyForPreview}
          busy={busy}
          readyForDownload={readyForDownload}
          singleFileResult={singleFileResult}
          totalFiles={files.length}
          onOptionsChange={updateOptions}
          onDownload={download}
          onReset={clearFiles}
        />
      </Card>
    </div>
  );
}
