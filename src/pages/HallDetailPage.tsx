import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { ArrowBack, DevicesOther, FilterAltOff, Map as MapIcon, ViewList } from '@mui/icons-material'
import { Alert, Box, Button, IconButton, Skeleton, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useHall } from '../hooks/useHall'
import { useHallDevices } from '../hooks/useHallDevices'
import { useActions } from '../hooks/useActions'
import { useHallFilters } from '../hooks/useHallFilters'
import { sortDevicesByUrgency } from '../utils/actionUtils'
import { countMatchingActions, filterHallDevices } from '../utils/filterUtils'
import HallFloorPlan from '../components/scenes/HallFloorPlan'
import DeviceListItem from '../components/scenes/DeviceListItem'
import FilterBar from '../components/controls/FilterBar'
import type { HallFilters } from '../model/filters'
import type { Device, MaintenanceAction } from '../model/types'

type ViewMode = 'floorplan' | 'list'

export default function HallDetailPage() {
  const { hallId } = useParams<{ hallId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<ViewMode>('floorplan')
  const { filters, setFilter, resetFilters, isDefault } = useHallFilters()

  const highlightDeviceId = searchParams.get('highlight') ?? undefined
  // "Toon op plattegrond" links here with a `highlight` query param so the
  // highlight survives a bookmark/refresh. The highlight only makes sense on
  // the floor plan, so force that view for as long as the param is present —
  // derived from render rather than synced via an effect.
  const effectiveView: ViewMode = highlightDeviceId ? 'floorplan' : view

  const hallQuery = useHall(hallId)
  const devicesQuery = useHallDevices(hallId)
  const actionsQuery = useActions()

  // Clear the `highlight` param again after a few seconds so the effect is
  // temporary, as the wireframe specifies.
  useEffect(() => {
    if (!highlightDeviceId) return
    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('highlight')
          return next
        },
        { replace: true },
      )
    }, 4000)
    return () => clearTimeout(timer)
  }, [highlightDeviceId, setSearchParams])

  const isLoading = hallQuery.isLoading || devicesQuery.isLoading || actionsQuery.isLoading
  const error = hallQuery.error ?? devicesQuery.error ?? actionsQuery.error

  const hall = hallQuery.data
  const devices = useMemo(() => devicesQuery.data ?? [], [devicesQuery.data])
  const actions = useMemo(() => actionsQuery.data ?? [], [actionsQuery.data])

  const filteredDevices = useMemo(
    () => filterHallDevices(devices, actions, filters),
    [devices, actions, filters],
  )
  const matchingActionsCount = useMemo(
    () => countMatchingActions(filteredDevices, actions, filters),
    [filteredDevices, actions, filters],
  )

  // A device linked to via "Toon op plattegrond" must always be visible on
  // the floor plan, even if the user's current filters would otherwise hide
  // it (e.g. its next action falls outside the active time window) — the
  // highlight would otherwise silently never appear.
  const floorPlanDevices = useMemo(() => {
    if (!highlightDeviceId || filteredDevices.some((device) => device.id === highlightDeviceId)) {
      return filteredDevices
    }
    const highlightDevice = devices.find((device) => device.id === highlightDeviceId)
    return highlightDevice ? [...filteredDevices, highlightDevice] : filteredDevices
  }, [filteredDevices, devices, highlightDeviceId])

  const handleRetry = () => {
    hallQuery.refetch()
    devicesQuery.refetch()
    actionsQuery.refetch()
  }

  const handleViewChange = (_: MouseEvent<HTMLElement>, next: ViewMode | null) => {
    if (next) setView(next)
  }

  if (!isLoading && !error && !hall) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
        <Typography variant="h6" component="h1">
          Deze hal bestaat niet (meer).
        </Typography>
        <Button component={RouterLink} to="/" startIcon={<ArrowBack />}>
          Terug naar het terrein
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate('/')} aria-label="Terug naar het terrein">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {hall ? hall.name : <Skeleton width={160} />}
        </Typography>
        <ToggleButtonGroup value={effectiveView} exclusive onChange={handleViewChange} size="small" aria-label="Weergave">
          <ToggleButton value="floorplan" aria-label="Plattegrond">
            <MapIcon fontSize="small" sx={{ mr: 0.75 }} />
            Plattegrond
          </ToggleButton>
          <ToggleButton value="list" aria-label="Lijst">
            <ViewList fontSize="small" sx={{ mr: 0.75 }} />
            Lijst
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <FilterBar filters={filters} setFilter={setFilter} resetFilters={resetFilters} isDefault={isDefault} />

      {isLoading && <Skeleton variant="rounded" width="100%" height={420} sx={{ borderRadius: '12px' }} />}

      {!isLoading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Opnieuw proberen
            </Button>
          }
        >
          De hal kon niet geladen worden.
        </Alert>
      )}

      {!isLoading && !error && hall && (
        <>
          {devices.length > 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              {filteredDevices.length} apparaten · {matchingActionsCount} acties binnen filters
            </Typography>
          )}

          {devices.length === 0 && (
            <EmptyState icon={<DevicesOther sx={{ fontSize: 48 }} />} text="Er zijn nog geen apparaten in deze hal." />
          )}

          {devices.length > 0 &&
            filteredDevices.length === 0 &&
            !(effectiveView === 'floorplan' && floorPlanDevices.length > 0) && (
              <EmptyState
                icon={<FilterAltOff sx={{ fontSize: 48 }} />}
                text="Geen apparaten binnen deze filters"
                action={
                  <Button size="small" onClick={resetFilters}>
                    Reset filters
                  </Button>
                }
              />
            )}

          {floorPlanDevices.length > 0 && effectiveView === 'floorplan' && (
            <HallFloorPlan
              hall={hall}
              devices={floorPlanDevices}
              actions={actions}
              filters={filters}
              highlightDeviceId={highlightDeviceId}
            />
          )}

          {filteredDevices.length > 0 && effectiveView === 'list' && (
            <DeviceListView devices={filteredDevices} actions={actions} filters={filters} />
          )}
        </>
      )}
    </Box>
  )
}

function EmptyState({ icon, text, action }: { icon: ReactNode; text: string; action?: ReactNode }) {
  return (
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
      {icon}
      <Typography variant="body1">{text}</Typography>
      {action}
    </Box>
  )
}

function DeviceListView({
  devices,
  actions,
  filters,
}: {
  devices: Device[]
  actions: MaintenanceAction[]
  filters: HallFilters
}) {
  const sortedDevices = sortDevicesByUrgency(devices, actions)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {sortedDevices.map((device) => (
        <DeviceListItem key={device.id} device={device} actions={actions} filters={filters} />
      ))}
    </Box>
  )
}
