import { createTheme, type PaletteMode } from '@mui/material/styles'

interface BlueprintPalette {
  surface: string
  panel: string
  panelBorder: string
  panelBorderHover: string
  gridLine: string
  appBar: string
  urgentText: string
  openText: string
  mutedIndicator: string
  mutedText: string
}

declare module '@mui/material/styles' {
  interface Palette {
    blueprint: BlueprintPalette
  }
  interface PaletteOptions {
    blueprint?: BlueprintPalette
  }
}

// The site map, hall floor plan and app bar are deliberately dark in both
// light and dark mode — they're a "monitor" surface (a blueprint/glass
// display), not regular page content, so this palette never changes with
// the theme mode.
const BLUEPRINT_PALETTE: BlueprintPalette = {
  surface: '#111C2B',
  panel: 'rgba(255,255,255,0.06)',
  panelBorder: 'rgba(255,255,255,0.12)',
  panelBorderHover: 'rgba(255,255,255,0.3)',
  gridLine: 'rgba(255,255,255,0.05)',
  appBar: '#0F1B2D',
  urgentText: '#FF6B6B',
  // A lighter blue than primary.main — primary.main reads too dark against
  // the blueprint's near-black surface, so open (non-urgent) actions get
  // this tint instead for readability.
  openText: '#64B5F6',
  mutedIndicator: 'rgba(255,255,255,0.25)',
  mutedText: 'rgba(255,255,255,0.6)',
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
      blueprint: BLUEPRINT_PALETTE,
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
