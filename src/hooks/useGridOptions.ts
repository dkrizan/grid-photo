import { type KeyboardEvent, useCallback, useMemo, useState } from 'react';

import { NUMERIC_FIELD_CONFIG } from '../constants/options';
import { ComposeOptions, NumericInputMap, NumericOptionKey } from '../types';
import { formatNumberInput } from '../utils';

function buildNumericInputs(options: ComposeOptions): NumericInputMap {
  return {
    rows: String(options.rows),
    cols: String(options.cols),
    widthCm: formatNumberInput(options.widthCm),
    heightCm: formatNumberInput(options.heightCm),
    dpi: String(options.dpi),
  };
}

export function useGridOptions(defaultOptions: ComposeOptions) {
  const [options, setOptions] = useState<ComposeOptions>({ ...defaultOptions });
  const [inputValues, setInputValues] = useState<NumericInputMap>(() => buildNumericInputs(defaultOptions));

  const toDisplayValue = useCallback((key: NumericOptionKey, value: number) => {
    if (key === 'widthCm' || key === 'heightCm') {
      return formatNumberInput(value);
    }
    return String(Math.round(value));
  }, []);

  const updateInputValue = useCallback((key: NumericOptionKey, value: string) => {
    setInputValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const revertInputValue = useCallback(
    (key: NumericOptionKey) => {
      setInputValues((prev) => {
        const fallback = buildNumericInputs(options)[key];
        if (prev[key] === fallback) return prev;
        return { ...prev, [key]: fallback };
      });
    },
    [options],
  );

  const commitNumericValue = useCallback(
    (key: NumericOptionKey) => {
      const raw = inputValues[key].trim();
      if (raw === '') {
        revertInputValue(key);
        return;
      }

      const config = NUMERIC_FIELD_CONFIG[key];

      if (config.type === 'float') {
        const parsed = Number.parseFloat(raw.replace(',', '.'));
        if (!Number.isFinite(parsed)) {
          revertInputValue(key);
          return;
        }
        const sanitized = Math.max(config.min, parsed);
        setOptions((prev) => {
          if (prev[key] === sanitized) return prev;
          return { ...prev, [key]: sanitized };
        });
        setInputValues((prev) => ({ ...prev, [key]: formatNumberInput(sanitized) }));
        return;
      }

      const parsedInt = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsedInt)) {
        revertInputValue(key);
        return;
      }
      const max = config.max ?? Number.POSITIVE_INFINITY;
      const sanitized = Math.max(config.min, Math.min(max, parsedInt));
      setOptions((prev) => {
        if (prev[key] === sanitized) return prev;
        return { ...prev, [key]: sanitized };
      });
      setInputValues((prev) => ({ ...prev, [key]: String(sanitized) }));
    },
    [inputValues, revertInputValue],
  );

  const handleNumericKeyDown = useCallback(
    (key: NumericOptionKey) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitNumericValue(key);
        event.currentTarget.blur();
      }
    },
    [commitNumericValue],
  );

  const updateOptions = useCallback(
    (patch: Partial<ComposeOptions>) => {
      setOptions((prev) => {
        const next = { ...prev, ...patch };

        setInputValues((prevInputs) => {
          let changed = false;
          const updated: NumericInputMap = { ...prevInputs };
          (['rows', 'cols', 'widthCm', 'heightCm', 'dpi'] as NumericOptionKey[]).forEach((key) => {
            if (key in patch) {
              const displayValue = toDisplayValue(key, next[key]);
              if (updated[key] !== displayValue) {
                updated[key] = displayValue;
                changed = true;
              }
            }
          });
          return changed ? updated : prevInputs;
        });

        return next;
      });
    },
    [toDisplayValue],
  );

  const numericHelpers = useMemo(
    () => ({
      updateInputValue,
      commitNumericValue,
      handleNumericKeyDown,
    }),
    [updateInputValue, commitNumericValue, handleNumericKeyDown],
  );

  return {
    options,
    inputValues,
    numericHelpers,
    updateOptions,
  };
}
