import { createContext, ReactNode, useContext } from 'react';

import { useGridBuilder } from '../hooks/useGridBuilder';
import { ComposeOptions } from '../types';

type GridBuilderContextValue = ReturnType<typeof useGridBuilder>;

interface GridBuilderProviderProps {
  children: ReactNode;
  defaultOptions?: ComposeOptions;
}

const GridBuilderContext = createContext<GridBuilderContextValue | null>(null);

export function GridBuilderProvider({
  children,
  defaultOptions,
}: GridBuilderProviderProps) {
  const value = useGridBuilder(defaultOptions);
  return (
    <GridBuilderContext.Provider value={value}>
      {children}
    </GridBuilderContext.Provider>
  );
}

export function useGridBuilderContext() {
  const context = useContext(GridBuilderContext);
  if (!context) {
    throw new Error('useGridBuilderContext must be used within a GridBuilderProvider');
  }
  return context;
}
