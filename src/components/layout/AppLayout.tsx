import { Factory, Logout } from '@mui/icons-material'
import { AppBar, Box, Chip, Container, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#0F1B2D',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Factory sx={{ color: 'rgba(255,255,255,0.7)' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            PlantPuls
          </Typography>
          {user && (
            <>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                {user.username}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                variant="outlined"
                sx={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.3)' }}
              />
              <Tooltip title="Uitloggen">
                <IconButton color="inherit" onClick={logout} size="small">
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
