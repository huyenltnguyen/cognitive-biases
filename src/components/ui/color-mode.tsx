import { ThemeProvider, useTheme } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export interface ColorModeProviderProps
  extends Omit<ThemeProviderProps, 'attribute'> {}

export function ColorModeProvider({ children, ...props }: ColorModeProviderProps) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </ThemeProvider>
  );
}

export type ColorMode = 'light' | 'dark';

export function useColorMode(): {
  colorMode: ColorMode;
  toggleColorMode: () => void;
} {
  const { resolvedTheme, setTheme } = useTheme();
  return {
    colorMode: (resolvedTheme ?? 'light') as ColorMode,
    toggleColorMode: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
  };
}
