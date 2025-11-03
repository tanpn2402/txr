// src/mantine.d.ts
import '@mantine/core';

declare module '@mantine/core' {
  export interface MantineTheme {
    radius: Record<'none' | 'sm' | 'md' | 'lg' | 'xl', string>;
  }

  export interface MantineThemeOverride {
    radius?: Record<'none' | 'sm' | 'md' | 'lg' | 'xl', string>;
  }
}
