import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Fabrieksonderhoud
          </Typography>
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Button
              variant="contained"
              onClick={() =>
                login({ username: 'Jan Peters', role: 'onderhoudsmedewerker' })
              }
            >
              Log in als onderhoudsmedewerker
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => login({ username: 'An Willems', role: 'beheerder' })}
            >
              Log in als beheerder
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
