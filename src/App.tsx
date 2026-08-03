import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { useAuth } from './hooks/useAuth'
import { useSettings } from './hooks/useSettings'
import { getTheme } from './theme/theme'
import LoginPage from './pages/LoginPage'
import SiteOverviewPage from './pages/SiteOverviewPage'
import HallDetailPage from './pages/HallDetailPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import InspectionPage from './pages/InspectionPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import AppLayout from './components/layout/AppLayout'

const queryClient = new QueryClient()

function AppRoutes() {
  const { user } = useAuth()

  if (!user) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<SiteOverviewPage />} />
        <Route path="/halls/:hallId" element={<HallDetailPage />} />
        <Route path="/halls/:hallId/inspection" element={<InspectionPage />} />
        <Route path="/devices/:deviceId" element={<DeviceDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

// The theme depends on settings (theme mode + OS preference for 'system'),
// so this needs to render inside SettingsProvider but outside/around
// everything that consumes the theme.
function ThemedApp() {
  const { settings } = useSettings()
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const effectiveMode = settings.themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : settings.themeMode
  const theme = useMemo(() => getTheme(effectiveMode), [effectiveMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ThemedApp />
      </SettingsProvider>
    </QueryClientProvider>
  )
}

export default App
