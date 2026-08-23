import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowBack, ArrowForward, CheckCircle, Close, Replay } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import CompleteActionDialog from '../components/dialogs/CompleteActionDialog'
import InspectionStepCard from '../components/scenes/InspectionStepCard'
import { useActions } from '../hooks/useActions'
import { useHall } from '../hooks/useHall'
import { useHallDevices } from '../hooks/useHallDevices'
import { searchParamsToFilters } from '../model/filters'
import type { Device, MaintenanceAction } from '../model/types'
import { filterHallDevices, getNextOpenMatchingAction } from '../utils/filterUtils'
import { computeWalkingRoute } from '../utils/routeUtils'

type InspectionStep = { device: Device; action: MaintenanceAction }
type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' }

export default function InspectionPage() {
  const { hallId } = useParams<{ hallId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filters = useMemo(() => searchParamsToFilters(searchParams), [searchParams])
  const backToHallUrl = `/halls/${hallId}?${searchParams.toString()}`

  const hallQuery = useHall(hallId)
  const devicesQuery = useHallDevices(hallId)
  const actionsQuery = useActions()

  const isLoading = hallQuery.isLoading || devicesQuery.isLoading || actionsQuery.isLoading
  const error = hallQuery.error ?? devicesQuery.error ?? actionsQuery.error
  const hall = hallQuery.data
  const devices = useMemo(() => devicesQuery.data ?? [], [devicesQuery.data])
  const actions = useMemo(() => actionsQuery.data ?? [], [actionsQuery.data])
  const dataReady = !isLoading && !error && Boolean(hall)

  const [roundToken, setRoundToken] = useState(0)
  const [computedForToken, setComputedForToken] = useState<number | null>(null)
  const [stepActionIds, setStepActionIds] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  if (dataReady && computedForToken !== roundToken) {
    const routeDevices = filterHallDevices(devices, actions, filters)
    const candidates = routeDevices
      .map((device) => ({ device, action: getNextOpenMatchingAction(device.id, actions, filters) }))
      .filter((entry): entry is InspectionStep => entry.action !== undefined)
    const ordered = computeWalkingRoute(
      candidates.map(({ device, action }) => ({ id: action.id, x: device.x, y: device.y })),
    )
    setStepActionIds(ordered.map((point) => point.id))
    setComputedForToken(roundToken)
    setCurrentIndex(0)
  }

  const steps = useMemo<InspectionStep[]>(() => {
    return stepActionIds
      .map((actionId) => {
        const action = actions.find((a) => a.id === actionId)
        const device = action && devices.find((d) => d.id === action.deviceId)
        return action && device ? { action, device } : undefined
      })
      .filter((step): step is InspectionStep => step !== undefined)
  }, [stepActionIds, actions, devices])

  const [completingAction, setCompletingAction] = useState<MaintenanceAction | undefined>(undefined)
  const [completedTimestamps, setCompletedTimestamps] = useState<Record<string, Date>>({})
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' })

  const isStepDone = useCallback(
    (step: InspectionStep) => step.action.status === 'uitgevoerd' || step.action.id in completedTimestamps,
    [completedTimestamps],
  )


  const stepsRef = useRef(steps)
  const isStepDoneRef = useRef(isStepDone)
  useEffect(() => {
    stepsRef.current = steps
    isStepDoneRef.current = isStepDone
  }, [steps, isStepDone])

  const doneCount = steps.filter(isStepDone).length
  const allDone = steps.length > 0 && doneCount === steps.length
  const currentStep = steps[currentIndex]

  const handleMarkDone = (action: MaintenanceAction) => setCompletingAction(action)
  const handleDialogClose = () => setCompletingAction(undefined)

  const handleCompleted = () => {
    if (!completingAction) return
    const completedId = completingAction.id
    setCompletedTimestamps((prev) => ({ ...prev, [completedId]: new Date() }))
    setSnackbar({ open: true, message: 'Actie gemarkeerd als uitgevoerd', severity: 'success' })
    window.setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = stepsRef.current.findIndex((step, index) => index > prevIndex && !isStepDoneRef.current(step))
        return nextIndex === -1 ? prevIndex : nextIndex
      })
    }, 600)
  }
  const handleError = () =>
    setSnackbar({
      open: true,
      message: 'Actie markeren als uitgevoerd is mislukt. Probeer opnieuw.',
      severity: 'error',
    })
  const handleSnackbarClose = () => setSnackbar((prev) => ({ ...prev, open: false }))

  const goPrev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), [])
  const goNext = useCallback(() => setCurrentIndex((i) => Math.min(steps.length - 1, i + 1)), [steps.length])

  useEffect(() => {

    if (completingAction) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goPrev()
      else if (event.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [completingAction, goPrev, goNext])

  const handleNewRound = () => {
    setCompletedTimestamps({})
    setRoundToken((token) => token + 1)
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minHeight: '80vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Button startIcon={<Close />} onClick={() => navigate(backToHallUrl)} color="inherit">
          Ronde verlaten
        </Button>
        <Typography variant="h6" sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700, flexGrow: 1, textAlign: 'center' }}>
          {hall ? `${hall.name} · inspectie` : <Skeleton width={160} sx={{ mx: 'auto' }} />}
        </Typography>
        <Box sx={{ width: { xs: 0, sm: 132 } }} />
      </Box>

      {isLoading && <Skeleton variant="rounded" width="100%" height={420} sx={{ borderRadius: '16px' }} />}

      {!isLoading && error && (
        <Alert severity="error">De inspectieronde kon niet geladen worden. Probeer de pagina te verversen.</Alert>
      )}

      {dataReady && steps.length === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 10 }}>
          <Typography variant="h6" component="h1">
            Geen acties binnen de huidige filters
          </Typography>
          <Typography color="text.secondary">Er valt niets te inspecteren met deze filterinstellingen.</Typography>
          <Button component={RouterLink} to={backToHallUrl} variant="contained" startIcon={<ArrowBack />}>
            Terug naar hal
          </Button>
        </Box>
      )}

      {dataReady && steps.length > 0 && allDone && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 10 }}>
          <CheckCircle color="success" sx={{ fontSize: 80 }} />
          <Typography variant="h5" sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700, textAlign: 'center' }}>
            Ronde voltooid — {steps.length} acties uitgevoerd
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button component={RouterLink} to={backToHallUrl} variant="contained" startIcon={<ArrowBack />}>
              Terug naar hal
            </Button>
            <Button onClick={handleNewRound} variant="outlined" startIcon={<Replay />}>
              Nieuwe ronde
            </Button>
          </Box>
        </Box>
      )}

      {dataReady && steps.length > 0 && !allDone && currentStep && (
        <>
          <Box sx={{ width: '100%', maxWidth: 640, mx: 'auto' }}>
            <Typography sx={{ textAlign: 'center', fontWeight: 600, mb: 1 }}>
              Stap {currentIndex + 1} van {steps.length}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(doneCount / steps.length) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <InspectionStepCard
            device={currentStep.device}
            action={currentStep.action}
            isDone={isStepDone(currentStep)}
            completedAt={completedTimestamps[currentStep.action.id]}
            onMarkDone={() => handleMarkDone(currentStep.action)}
            onShowOnMap={() => navigate(`/halls/${hallId}?highlight=${currentStep.device.id}`)}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, mt: 'auto', pt: 2, pb: { xs: 2, sm: 0 } }}>
            <IconButton
              size="large"
              onClick={goPrev}
              disabled={currentIndex === 0}
              aria-label="Vorige stap"
              sx={{ width: 64, height: 64, border: '1px solid', borderColor: 'divider' }}
            >
              <ArrowBack fontSize="large" />
            </IconButton>
            <IconButton
              size="large"
              onClick={goNext}
              disabled={currentIndex === steps.length - 1}
              aria-label="Volgende stap"
              sx={{ width: 64, height: 64, border: '1px solid', borderColor: 'divider' }}
            >
              <ArrowForward fontSize="large" />
            </IconButton>
          </Box>
        </>
      )}

      <CompleteActionDialog
        action={completingAction}
        open={Boolean(completingAction)}
        onClose={handleDialogClose}
        onCompleted={handleCompleted}
        onError={handleError}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
