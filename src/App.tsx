import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { theme } from './theme/theme'
import LoginPage from './pages/LoginPage'
import SiteOverviewPage from './pages/SiteOverviewPage'
import HallDetailPage from './pages/HallDetailPage'
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
