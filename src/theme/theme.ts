import { createTheme, type PaletteMode } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    siteMap: {
      background: string
      panel: string
      panelBorder: string
      panelBorderHover: string
      gridLine: string
    }
  }
  interface PaletteOptions {
    siteMap?: {
      background: string
      panel: string
      panelBorder: string
      panelBorderHover: string
      gridLine: string
    }
  }
}

// The site map and hall floor plan are deliberately dark in both light and
// dark mode — they're a "monitor" surface (a blueprint/glass display), not
// regular page content, so this palette never changes with the theme mode.
const SITE_MAP_PALETTE = {
  background: '#111C2B',
  panel: 'rgba(255,255,255,0.06)',
  panelBorder: 'rgba(255,255,255,0.12)',
  panelBorderHover: 'rgba(255,255,255,0.3)',
  gridLine: 'rgba(255,255,255,0.05)',
}

export function getTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1565C0',
      },
      secondary: {
        main: '#FFB300',
      },
      error: {
        main: '#D32F2F',
      },
      warning: {
        main: '#F57C00',
      },
      success: {
        main: '#2E7D32',
      },
      background:
        mode === 'dark'
          ? {
              default: '#0B1420',
              paper: '#15212F',
            }
          : {
              default: '#F6F8FA',
            },
      siteMap: SITE_MAP_PALETTE,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontFamily: '"Archivo", sans-serif', fontWeight: 700 },
      h2: { fontFamily: '"Archivo", sans-serif', fontWeight: 700 },
      h3: { fontFamily: '"Archivo", sans-serif', fontWeight: 700 },
      h4: { fontFamily: '"Archivo", sans-serif', fontWeight: 700 },
      h5: { fontFamily: '"Archivo", sans-serif', fontWeight: 700 },
      h6: { fontFamily: '"Archivo", sans-serif', fontWeight: 600 },
    },
  })
}
