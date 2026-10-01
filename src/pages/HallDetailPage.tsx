import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { ArrowBack, DevicesOther, FilterAltOff, Map as MapIcon, PlayArrow, ViewList } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  IconButton,
  Skeleton,
  Snackbar,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useHall } from '../hooks/useHall'
import { useHallDevices } from '../hooks/useHallDevices'
import { useActions } from '../hooks/useActions'
import { useHallFilters } from '../hooks/useHallFilters'
import { useSettings } from '../hooks/useSettings'
import { sortDevicesByUrgency } from '../utils/actionUtils'
import { countMatchingActions, filterHallDevices, getNextOpenMatchingAction } from '../utils/filterUtils'
import HallFloorPlan from '../components/scenes/HallFloorPlan'
import DeviceListItem from '../components/scenes/DeviceListItem'
import FilterBar from '../components/controls/FilterBar'
import DeviceForm, { type DeviceFormContext } from '../components/forms/DeviceForm'
import { DEFAULT_FILTERS, filtersToSearchParams, searchParamsToFilters, type HallFilters } from '../model/filters'
import type { Device, MaintenanceAction } from '../model/types'

type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' }

type ViewMode = 'floorplan' | 'list'

export default function HallDetailPage() {
  const { hallId } = useParams<{ hallId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const isAdmin = user?.role === 'beheerder'
  const { settings } = useSettings()
  const [view, setView] = useState<ViewMode>(() => (settings.defaultHallView === 'lijst' ? 'list' : 'floorplan'))

  const defaultFilters = useMemo<HallFilters>(
    () => ({ ...DEFAULT_FILTERS, timeWindow: settings.defaultTimeWindow }),
    [settings.defaultTimeWindow],
  )

  const parsedFilters = searchParamsToFilters(searchParams)
  const initialFilters: HallFilters = searchParams.has('timeWindow')
    ? parsedFilters
    : { ...parsedFilters, timeWindow: settings.defaultTimeWindow }
  const { filters, setFilter, resetFilters, isDefault } = useHallFilters(initialFilters, defaultFilters)

  const highlightDeviceId = searchParams.get('highlight') ?? undefined

  const effectiveView: ViewMode = highlightDeviceId ? 'floorplan' : view

  const hallQuery = useHall(hallId)
  const devicesQuery = useHallDevices(hallId)
  const actionsQuery = useActions()


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

  //puur informatief
  const matchingActionsCount = useMemo(
    () => countMatchingActions(filteredDevices, actions, filters),
    [filteredDevices, actions, filters],
  )

  const hasRoundActions = useMemo(
    () => filteredDevices.some((device) => getNextOpenMatchingAction(device.id, actions, filters) !== undefined),
    [filteredDevices, actions, filters],
  )


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

  const handleStartInspection = () => {
    if (!hallId) return
    navigate(`/halls/${hallId}/inspection?${filtersToSearchParams(filters).toString()}`)
  }

  const [deviceFormContext, setDeviceFormContext] = useState<DeviceFormContext | undefined>(undefined)
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' })

  const handleCanvasClick = (position: { x: number; y: number }) => {
    if (!hallId) return
    setDeviceFormContext({ mode: 'create', hallId, x: position.x, y: position.y })
  }
  const handleDeviceFormClose = () => setDeviceFormContext(undefined)
  const handleDeviceSaved = (message: string) => setSnackbar({ open: true, message, severity: 'success' })
  const handleDeviceError = (message: string) => setSnackbar({ open: true, message, severity: 'error' })
  const handleSnackbarClose = () => setSnackbar((prev) => ({ ...prev, open: false }))

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
        <Tooltip title={hasRoundActions ? '' : 'Geen acties binnen de huidige filters'}>
          <span>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={handleStartInspection}
              disabled={!hall || !hasRoundActions}
            >
              Start inspectie
            </Button>
          </span>
        </Tooltip>
      </Box>

      <FilterBar
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        isDefault={isDefault}
        defaultFilters={defaultFilters}
      />

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

            !(effectiveView === 'floorplan' && (floorPlanDevices.length > 0 || isAdmin)) && (
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

          {(floorPlanDevices.length > 0 || isAdmin) && effectiveView === 'floorplan' && (
            <HallFloorPlan
              hall={hall}
              devices={floorPlanDevices}
              actions={actions}
              filters={filters}
              highlightDeviceId={highlightDeviceId}
              onCanvasClick={isAdmin ? handleCanvasClick : undefined}
            />
          )}

          {filteredDevices.length > 0 && effectiveView === 'list' && (
            <DeviceListView devices={filteredDevices} actions={actions} filters={filters} />
          )}
        </>
      )}

      <DeviceForm
        open={Boolean(deviceFormContext)}
        context={deviceFormContext}
        onClose={handleDeviceFormClose}
        onSaved={handleDeviceSaved}
        onError={handleDeviceError}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
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
