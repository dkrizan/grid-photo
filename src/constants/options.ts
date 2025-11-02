import { ComposeOptions, NumericOptionKey } from '../types';

export const DEFAULT_OPTIONS: ComposeOptions = {
  gapPx: 8,
  separatorColor: '#ffffff',
  output: 'image/jpeg',
  quality: 0.92,
  rows: 1,
  cols: 2,
  widthCm: 15,
  heightCm: 10,
  dpi: 300,
  cropToFill: false,
};

type NumericFieldConfig =
  | { type: 'int'; min: number; max?: number }
  | { type: 'float'; min: number; max?: number };

export const NUMERIC_FIELD_CONFIG: Record<NumericOptionKey, NumericFieldConfig> = {
  rows: { type: 'int', min: 1, max: 6 },
  cols: { type: 'int', min: 1, max: 6 },
  widthCm: { type: 'float', min: 1 },
  heightCm: { type: 'float', min: 1 },
  dpi: { type: 'int', min: 72, max: 1200 },
};
