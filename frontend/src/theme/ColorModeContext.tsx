import { CssBaseline, ThemeProvider } from '@mui/material';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { ThemePreference } from '../types/models';
import { createAppTheme } from './theme';

interface ColorModeContextValue {
  mode: ThemePreference;
  toggleMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);
const THEME_KEY = 'finance-flow-theme';

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const { user, syncThemePreference } = useAuth();
  const [mode, setMode] = useState<ThemePreference>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemePreference | null) ?? 'LIGHT';
  });

  useEffect(() => {
    if (user?.themePreference) {
      setMode(user.themePreference);
      localStorage.setItem(THEME_KEY, user.themePreference);
    }
  }, [user?.themePreference]);

  const toggleMode = useCallback(() => {
    const nextMode: ThemePreference = mode === 'LIGHT' ? 'DARK' : 'LIGHT';
    setMode(nextMode);
    localStorage.setItem(THEME_KEY, nextMode);
    void syncThemePreference(nextMode);
  }, [mode, syncThemePreference]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode precisa ser usado dentro de ColorModeProvider');
  }
  return context;
}
