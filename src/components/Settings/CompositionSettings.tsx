import { Tabs, Text, Heading } from '@radix-ui/themes';
import { ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';

import { ComposeOptions, NumericInputMap, NumericOptionKey } from '../../types';

export interface NumericFieldHandlers {
  updateInputValue: (key: NumericOptionKey, value: string) => void;
  commitNumericValue: (key: NumericOptionKey) => void;
  handleNumericKeyDown: (
    key: NumericOptionKey
  ) => (event: ReactKeyboardEvent<HTMLInputElement>) => void;
}

interface CompositionSettingsProps {
  options: ComposeOptions;
  inputValues: NumericInputMap;
  numericHelpers: NumericFieldHandlers;
  groupSize: number;
  outputWidthPx: number;
  outputHeightPx: number;
  onOptionsChange: (patch: Partial<ComposeOptions>) => void;
}

const TAB_TRIGGER_CLASS =
  'flex-1 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-800/80 ' +
  'hover:text-slate-100 data-[state=active]:bg-violet-600 data-[state=active]:text-white ' +
  'data-[state=active]:hover:bg-violet-600 data-[state=active]:hover:text-white cursor-pointer ' +
  'before:bg-transparent hover:*:bg-transparent data-[state=active]:hover:*:bg-transparent';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const filterIntegerInput = (value: string) => value.replace(/[^\d]/g, '');

const filterDecimalInput = (value: string) => {
  let decimalSeen = false;
  let result = '';
  for (const ch of value) {
    if (/\d/.test(ch)) {
      result += ch;
      continue;
    }
    if ((ch === '.' || ch === ',') && !decimalSeen) {
      result += ch;
      decimalSeen = true;
    }
  }
  return result;
};

export function CompositionSettings({
  options,
  inputValues,
  numericHelpers,
  groupSize,
  outputWidthPx,
  outputHeightPx,
  onOptionsChange,
}: CompositionSettingsProps) {
  const { updateInputValue, commitNumericValue, handleNumericKeyDown } =
    numericHelpers;

  const handleCropChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({ cropToFill: event.target.checked });
  };

  const handleGapChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10);
    const next = Number.isFinite(parsed)
      ? clamp(parsed, 0, 120)
      : options.gapPx;
    if (next !== options.gapPx) {
      onOptionsChange({ gapPx: next });
    }
  };

  const handleSeparatorColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({ separatorColor: event.target.value });
  };

  const handleOutputChange = (format: ComposeOptions['output']) => () => {
    if (options.output !== format) {
      onOptionsChange({ output: format });
    }
  };

  const handleQualityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value);
    if (!Number.isFinite(parsed)) return;
    if (parsed !== options.quality) {
      onOptionsChange({ quality: parsed });
    }
  };

  return (
    <div className="space-y-4">
      <Heading as="h2" size="3" className="text-slate-200">
        Composition &amp; layout settings
      </Heading>

      <Tabs.Root defaultValue="layout" className="w-full">
        <Tabs.List className="mb-4 flex flex-wrap gap-2 rounded-xl border border-slate-800/60 bg-slate-900/60 p-1">
          <Tabs.Trigger value="layout" className={TAB_TRIGGER_CLASS}>
            Layout
          </Tabs.Trigger>
          <Tabs.Trigger value="dimensions" className={TAB_TRIGGER_CLASS}>
            Dimensions
          </Tabs.Trigger>
          <Tabs.Trigger value="output" className={TAB_TRIGGER_CLASS}>
            Output
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="layout" className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Rows
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={inputValues.rows}
                onChange={(event) =>
                  updateInputValue(
                    'rows',
                    filterIntegerInput(event.target.value)
                  )
                }
                onBlur={() => commitNumericValue('rows')}
                onKeyDown={handleNumericKeyDown('rows')}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-violet-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Columns
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={inputValues.cols}
                onChange={(event) =>
                  updateInputValue(
                    'cols',
                    filterIntegerInput(event.target.value)
                  )
                }
                onBlur={() => commitNumericValue('cols')}
                onKeyDown={handleNumericKeyDown('cols')}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-violet-500 focus:outline-none"
              />
            </label>
          </div>

          <Text size="2" className="text-slate-400">
            Generates grids with {groupSize} photo{groupSize === 1 ? '' : 's'}.
          </Text>

          <label className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
            <input
              id="crop"
              type="checkbox"
              className="h-4 w-4 rounded border border-slate-600 bg-slate-950 text-violet-500 focus:ring-violet-500"
              checked={Boolean(options.cropToFill)}
              onChange={handleCropChange}
            />
            <span>Fill entire cell (crop photos)</span>
          </label>

          <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
            <div className="flex flex-col gap-3">
              <Text size="2" className="uppercase tracking-wide text-slate-400">
                Separator
              </Text>

              <div className="flex flex-col gap-1">
                <input
                  type="range"
                  min={0}
                  max={120}
                  value={options.gapPx}
                  onChange={handleGapChange}
                  className="accent-violet-500"
                />
                <Text size="1" className="text-slate-400">
                  {options.gapPx}px
                </Text>
              </div>

              <div className="flex items-center gap-3">
                <Text
                  size="1"
                  className="uppercase tracking-wide text-slate-400"
                >
                  Color
                </Text>
                <input
                  type="color"
                  value={options.separatorColor}
                  onChange={handleSeparatorColorChange}
                  className="h-10 w-14 cursor-pointer overflow-hidden rounded border border-slate-700 bg-slate-950"
                />
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="dimensions" className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Width
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputValues.widthCm}
                  onChange={(event) =>
                    updateInputValue(
                      'widthCm',
                      filterDecimalInput(event.target.value)
                    )
                  }
                  onBlur={() => commitNumericValue('widthCm')}
                  onKeyDown={handleNumericKeyDown('widthCm')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-violet-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400">cm</span>
              </div>
            </label>

            <label className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Height
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputValues.heightCm}
                  onChange={(event) =>
                    updateInputValue(
                      'heightCm',
                      filterDecimalInput(event.target.value)
                    )
                  }
                  onBlur={() => commitNumericValue('heightCm')}
                  onKeyDown={handleNumericKeyDown('heightCm')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-violet-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400">cm</span>
              </div>
            </label>

            <label className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                DPI
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputValues.dpi}
                  onChange={(event) =>
                    updateInputValue(
                      'dpi',
                      filterIntegerInput(event.target.value)
                    )
                  }
                  onBlur={() => commitNumericValue('dpi')}
                  onKeyDown={handleNumericKeyDown('dpi')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-violet-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400">dpi</span>
              </div>
            </label>
          </div>

          <Text size="2" className="text-slate-400">
            Output preview: {outputWidthPx} × {outputHeightPx} px
          </Text>
        </Tabs.Content>

        <Tabs.Content value="output" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
              <span>JPEG</span>
              <input
                type="radio"
                name="format"
                checked={options.output === 'image/jpeg'}
                onChange={handleOutputChange('image/jpeg')}
                className="h-4 w-4 border border-slate-600 text-violet-500 focus:ring-violet-500"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
              <span>PNG</span>
              <input
                type="radio"
                name="format"
                checked={options.output === 'image/png'}
                onChange={handleOutputChange('image/png')}
                className="h-4 w-4 border border-slate-600 text-violet-500 focus:ring-violet-500"
              />
            </label>
          </div>

          {options.output === 'image/jpeg' && (
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
              <Text size="1" className="uppercase tracking-wide text-slate-400">
                JPEG quality
              </Text>
              <div className="mt-3 flex items-center gap-4">
                <input
                  type="range"
                  min={0.6}
                  max={1}
                  step={0.02}
                  value={options.quality}
                  onChange={handleQualityChange}
                  className="flex-1 accent-violet-500"
                />
                <Text size="2" className="w-16 text-right text-slate-200">
                  {options.quality.toFixed(2)}
                </Text>
              </div>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
