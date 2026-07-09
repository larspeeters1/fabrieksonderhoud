import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fabrieksonderhoud
          </Typography>
          {user && (
            <>
              <Typography variant="body1">
                {user.username} ({user.role})
              </Typography>
              <Button color="inherit" onClick={logout}>
                Uitloggen
              </Button>
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
