import { alpha, createTheme } from '@mui/material/styles';
import type { ThemePreference } from '../types/models';

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: {
      panel: string;
      floating: string;
    };
  }

  interface ThemeOptions {
    customShadows?: {
      panel?: string;
      floating?: string;
    };
  }
}

export function createAppTheme(mode: ThemePreference) {
  const isDark = mode === 'DARK';
  const borderColor = isDark ? alpha('#E2E8F0', 0.1) : alpha('#0F172A', 0.09);

  const palette = {
    primary: { main: '#0E7490' },
    secondary: { main: '#F97316' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    background: {
      default: isDark ? '#07111B' : '#F4F7FB',
      paper: isDark ? '#0E1726' : '#FFFFFF',
    },
    text: {
      primary: isDark ? '#F8FAFC' : '#0F172A',
      secondary: isDark ? '#CBD5E1' : '#475569',
    },
  };

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      ...palette,
      divider: isDark ? alpha('#E2E8F0', 0.12) : alpha('#0F172A', 0.1),
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
      h1: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif', fontWeight: 700, letterSpacing: 0, lineHeight: 1.14 },
      h2: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif', fontWeight: 700, letterSpacing: 0, lineHeight: 1.18 },
      h3: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif', fontWeight: 700, letterSpacing: 0, lineHeight: 1.22 },
      h4: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif', fontWeight: 700, letterSpacing: 0, lineHeight: 1.24 },
      h5: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif', fontWeight: 700, letterSpacing: 0, lineHeight: 1.25 },
      h6: { fontWeight: 700, letterSpacing: 0, lineHeight: 1.32 },
      subtitle1: { fontWeight: 700, lineHeight: 1.35 },
      subtitle2: { fontWeight: 700, lineHeight: 1.35 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.55 },
      caption: { lineHeight: 1.45 },
      button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
    },
    shape: {
      borderRadius: 12,
    },
    customShadows: {
      panel: isDark
        ? '0 18px 42px rgba(2, 12, 27, 0.4)'
        : '0 18px 42px rgba(15, 23, 42, 0.1)',
      floating: isDark
        ? '0 16px 30px rgba(8, 47, 73, 0.32)'
        : '0 16px 32px rgba(14, 116, 144, 0.14)',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            overflowX: 'hidden',
          },
          '::selection': {
            background: alpha(palette.primary.main, 0.18),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${borderColor}`,
            borderRadius: 20,
            boxShadow: isDark
              ? '0 12px 30px rgba(2, 12, 27, 0.28)'
              : '0 12px 30px rgba(15, 23, 42, 0.07)',
            transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 20,
            '&:last-child': {
              paddingBottom: 20,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow: 'none',
            minHeight: 40,
            paddingInline: 16,
            transition: 'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              boxShadow: isDark ? '0 10px 22px rgba(0, 0, 0, 0.22)' : '0 10px 22px rgba(15, 23, 42, 0.1)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          sizeLarge: {
            minHeight: 46,
            paddingInline: 20,
          },
          sizeSmall: {
            minHeight: 34,
            paddingInline: 12,
            borderRadius: 12,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'background-color 160ms ease, color 160ms ease, transform 160ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          sizeSmall: {
            borderRadius: 10,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            minHeight: 46,
            backgroundColor: isDark ? alpha('#020617', 0.18) : alpha('#FFFFFF', 0.72),
            transition: 'background-color 160ms ease, box-shadow 160ms ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(palette.primary.main, 0.45),
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(palette.primary.main, 0.14)}`,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
            },
          },
          input: {
            paddingTop: 12,
            paddingBottom: 12,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginLeft: 0,
            lineHeight: 1.4,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 700,
            minHeight: 28,
          },
          label: {
            paddingInline: 10,
          },
          icon: {
            fontSize: 18,
            marginLeft: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 22,
            boxShadow: isDark
              ? '0 26px 80px rgba(0, 0, 0, 0.48)'
              : '0 26px 80px rgba(15, 23, 42, 0.24)',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: '24px 28px 10px',
            fontWeight: 800,
            lineHeight: 1.25,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: '14px 28px 8px',
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            gap: 10,
            padding: '18px 28px 28px',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottomColor: borderColor,
            paddingTop: 14,
            paddingBottom: 14,
            verticalAlign: 'middle',
          },
          head: {
            color: palette.text.secondary,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 140ms ease',
            '&:last-child .MuiTableCell-root': {
              borderBottom: 0,
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            alignItems: 'center',
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            bottom: 24,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            overflow: 'hidden',
            backgroundColor: isDark ? alpha('#E2E8F0', 0.12) : alpha('#0F172A', 0.08),
          },
          bar: {
            borderRadius: 999,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: 18,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: 'none',
            background: isDark
              ? 'linear-gradient(180deg, rgba(14,23,38,0.98), rgba(7,17,27,0.95))'
              : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,247,251,0.96))',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            minHeight: 44,
            transition: 'background-color 160ms ease, color 160ms ease, transform 160ms ease',
            '&:hover': {
              transform: 'translateX(2px)',
            },
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 48,
          },
        },
      },
    },
  });
}
