export type OutputFormat = 'image/jpeg' | 'image/png';

export interface ComposeOptions {
  gapPx: number;
  separatorColor: string;
  output: OutputFormat;
  quality: number;
  rows: number;
  cols: number;
  widthCm: number;
  heightCm: number;
  dpi: number;
  cropToFill?: boolean;
}

export type NumericOptionKey = 'rows' | 'cols' | 'widthCm' | 'heightCm' | 'dpi';

export type NumericInputMap = Record<NumericOptionKey, string>;
