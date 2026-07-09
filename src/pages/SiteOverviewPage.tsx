import { Factory } from '@mui/icons-material'
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material'
import { useHalls } from '../hooks/useHalls'
import { useDevices } from '../hooks/useDevices'
import { useActions } from '../hooks/useActions'
import { calculateHallStats } from '../utils/hallStats'
import HallCard from '../components/scenes/HallCard'

const SITE_MARGIN = 40

export default function SiteOverviewPage() {
  const hallsQuery = useHalls()
  const devicesQuery = useDevices()
  const actionsQuery = useActions()

  const isLoading = hallsQuery.isLoading || devicesQuery.isLoading || actionsQuery.isLoading
  const error = hallsQuery.error ?? devicesQuery.error ?? actionsQuery.error

  const handleRetry = () => {
    hallsQuery.refetch()
    devicesQuery.refetch()
    actionsQuery.refetch()
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Fabrieksterrein
      </Typography>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Opnieuw proberen
            </Button>
          }
        >
          De plattegrond kon niet geladen worden.
        </Alert>
      )}

      {!isLoading && !error && hallsQuery.data && hallsQuery.data.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Factory sx={{ fontSize: 48 }} />
          <Typography variant="body1">Er zijn nog geen fabriekshallen bekend.</Typography>
        </Box>
      )}

      {!isLoading && !error && hallsQuery.data && hallsQuery.data.length > 0 && (
        <SitePlan
          halls={hallsQuery.data}
          devices={devicesQuery.data ?? []}
          actions={actionsQuery.data ?? []}
        />
      )}
    </Box>
  )
}

function SitePlan({
  halls,
  devices,
  actions,
}: {
  halls: NonNullable<ReturnType<typeof useHalls>['data']>
  devices: NonNullable<ReturnType<typeof useDevices>['data']>
  actions: NonNullable<ReturnType<typeof useActions>['data']>
}) {
  const siteWidth = Math.max(...halls.map((hall) => hall.x + hall.width)) + SITE_MARGIN
  const siteHeight = Math.max(...halls.map((hall) => hall.y + hall.height)) + SITE_MARGIN

  return (
    <Box
      sx={{
        overflow: 'auto',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'grey.50',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: siteWidth,
          height: siteHeight,
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        {halls.map((hall) => (
          <HallCard key={hall.id} hall={hall} stats={calculateHallStats(hall, devices, actions)} />
        ))}
      </Box>
    </Box>
  )
}
