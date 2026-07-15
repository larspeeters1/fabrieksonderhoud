import { Factory } from '@mui/icons-material'
import { Alert, Box, Button, Skeleton, Typography } from '@mui/material'
import { useHalls } from '../hooks/useHalls'
import { useDevices } from '../hooks/useDevices'
import { useActions } from '../hooks/useActions'
import { calculateHallStats, getHallDeviceMarkers } from '../utils/hallStats'
import HallCard from '../components/scenes/HallCard'

const SITE_MARGIN = 40
const HALL_SCALE = 1.4

export default function SiteOverviewPage() {
  const hallsQuery = useHalls()
  const devicesQuery = useDevices()
  const actionsQuery = useActions()

  const isLoading = hallsQuery.isLoading || devicesQuery.isLoading || actionsQuery.isLoading
  const error = hallsQuery.error ?? devicesQuery.error ?? actionsQuery.error

  const halls = hallsQuery.data ?? []
  const devices = devicesQuery.data ?? []
  const actions = actionsQuery.data ?? []

  const totalStats = halls
    .map((hall) => calculateHallStats(hall, devices, actions))
    .reduce(
      (totals, stats) => ({
        openCount: totals.openCount + stats.openCount,
        overdueCount: totals.overdueCount + stats.overdueCount,
      }),
      { openCount: 0, overdueCount: 0 },
    )

  const handleRetry = () => {
    hallsQuery.refetch()
    devicesQuery.refetch()
    actionsQuery.refetch()
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Fabrieksterrein
        </Typography>
        {!isLoading && !error && halls.length > 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {halls.length} hallen · {totalStats.openCount} open acties · {totalStats.overdueCount} urgent
          </Typography>
        )}
      </Box>

      {isLoading && <Skeleton variant="rounded" width="100%" height={480} sx={{ borderRadius: '12px' }} />}

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

      {!isLoading && !error && halls.length === 0 && (
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

      {!isLoading && !error && halls.length > 0 && (
        <SitePlan halls={halls} devices={devices} actions={actions} />
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
  const scaledHalls = halls.map((hall) => ({
    ...hall,
    x: hall.x * HALL_SCALE,
    y: hall.y * HALL_SCALE,
    width: hall.width * HALL_SCALE,
    height: hall.height * HALL_SCALE,
  }))

  const siteWidth = Math.max(...scaledHalls.map((hall) => hall.x + hall.width)) + SITE_MARGIN
  const siteHeight = Math.max(...scaledHalls.map((hall) => hall.y + hall.height)) + SITE_MARGIN

  return (
    <Box
      sx={{
        overflow: 'auto',
        borderRadius: '12px',
        backgroundColor: (theme) => theme.palette.siteMap.background,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: siteWidth,
          height: siteHeight,
          backgroundImage: (theme) =>
            `linear-gradient(to right, ${theme.palette.siteMap.gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${theme.palette.siteMap.gridLine} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      >
        {scaledHalls.map((hall, index) => (
          <HallCard
            key={hall.id}
            hall={hall}
            stats={calculateHallStats(hall, devices, actions)}
            deviceMarkers={getHallDeviceMarkers(halls[index], devices, actions)}
          />
        ))}
      </Box>
    </Box>
  )
}
