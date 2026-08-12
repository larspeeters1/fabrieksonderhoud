import { Factory, Logout, Settings } from '@mui/icons-material'
import { AppBar, Box, Chip, Container, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: (theme) => theme.palette.blueprint.appBar,
          borderBottom: (theme) => `1px solid ${theme.palette.blueprint.panelBorder}`,
        }}
      >
          <Toolbar sx={{ gap: { xs: 0.5, sm: 2 } }}>
              <Factory sx={{ color: 'rgba(255,255,255,0.7)' }} />
              <Typography
                  variant="h6"
                  component="div"
                  noWrap
                  sx={{
                      flexGrow: 1,
                      minWidth: 0,
                      fontWeight: 600,
                      display: { xs: 'none', sm: 'block' },
                  }}
              >
                  PlantPuls
              </Typography>
              {/* op xs vervangt deze spacer de verborgen titel */}
              <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />
              {user && (
                  <>
                      <Typography
                          variant="body2"
                          noWrap
                          sx={{
                              color: 'rgba(255,255,255,0.85)',
                              minWidth: 0,
                              maxWidth: { xs: 110, sm: 'none' },
                          }}
                      >
                          {user.username}
                      </Typography>
                      <Chip
                          label={user.role === 'beheerder' ? 'Beheerder' : 'Medewerker'}
                          size="small"
                          variant="outlined"
                          sx={{
                              flexShrink: 0,
                              display: { xs: 'none', sm: 'flex' },
                              color: 'rgba(255,255,255,0.85)',
                              borderColor: 'rgba(255,255,255,0.3)',
                          }}
                      />
                      <Tooltip title="Instellingen">
                          <IconButton color="inherit" onClick={() => navigate('/settings')} size="small" sx={{ flexShrink: 0 }}>
                              <Settings fontSize="small" />
                          </IconButton>
                      </Tooltip>
                      <Tooltip title="Uitloggen">
                          <IconButton color="inherit" onClick={logout} size="small" sx={{ flexShrink: 0 }}>
                              <Logout fontSize="small" />
                          </IconButton>
                      </Tooltip>
                  </>
              )}
          </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
