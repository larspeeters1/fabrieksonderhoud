import { useState } from 'react'
import { ArrowBack, Check, MyLocation } from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import CompleteActionDialog from '../components/dialogs/CompleteActionDialog'
import CategoryIcon from '../components/scenes/CategoryIcon'
import NextActionCard from '../components/scenes/NextActionCard'
import { useDevice } from '../hooks/useDevice'
import { useDeviceActions } from '../hooks/useDeviceActions'
import { useHall } from '../hooks/useHall'
import type { Device, DeviceCategory, MaintenanceAction } from '../model/types'
import { getUrgency, splitDeviceActions } from '../utils/actionUtils'
import { formatDeadlineShort } from '../utils/dateUtils'

const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  machine: 'Machine',
  band: 'Band',
  lamp: 'Lamp',
}

type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' }

export default function DeviceDetailPage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const navigate = useNavigate()

  const deviceQuery = useDevice(deviceId)
  const actionsQuery = useDeviceActions(deviceId)
  const device = deviceQuery.data
  const hallQuery = useHall(device?.hallId)

  const isLoading = deviceQuery.isLoading || actionsQuery.isLoading
  const error = deviceQuery.error ?? actionsQuery.error

  const actions = actionsQuery.data ?? []
  const { nextAction, otherOpenActions, executedActions } = splitDeviceActions(actions)

  const [completingAction, setCompletingAction] = useState<MaintenanceAction | undefined>(undefined)
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' })

  const handleRetry = () => {
    deviceQuery.refetch()
    actionsQuery.refetch()
  }

  const handleMarkDone = (action: MaintenanceAction) => setCompletingAction(action)
  const handleDialogClose = () => setCompletingAction(undefined)
  const handleCompleted = () =>
    setSnackbar({ open: true, message: 'Actie gemarkeerd als uitgevoerd', severity: 'success' })
  const handleError = () =>
    setSnackbar({
      open: true,
      message: 'Actie markeren als uitgevoerd is mislukt. Probeer opnieuw.',
      severity: 'error',
    })
  const handleSnackbarClose = () => setSnackbar((prev) => ({ ...prev, open: false }))

  if (!isLoading && !error && !device) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
        <Typography variant="h6" component="h1">
          Apparaat niet gevonden
        </Typography>
        <Button component={RouterLink} to="/" startIcon={<ArrowBack />}>
          Terug naar het terrein
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate(-1)} aria-label="Terug">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {device ? device.name : <Skeleton width={200} />}
        </Typography>
        {device && (
          <Button
            variant="outlined"
            startIcon={<MyLocation />}
            onClick={() => navigate(`/halls/${device.hallId}?highlight=${device.id}`)}
          >
            Toon op plattegrond
          </Button>
        )}
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rounded" width="100%" height={140} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="rounded" width="100%" height={180} sx={{ borderRadius: '12px' }} />
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
          Het apparaat kon niet geladen worden.
        </Alert>
      )}

      {!isLoading && !error && device && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <DeviceInfoPanel device={device} hallName={hallQuery.data?.name} />

          <NextActionCard action={nextAction} onMarkDone={handleMarkDone} />

          {otherOpenActions.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Overige open acties ({otherOpenActions.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {otherOpenActions.map((action) => (
                  <OpenActionRow key={action.id} action={action} onMarkDone={handleMarkDone} />
                ))}
              </Box>
            </Box>
          )}

          {executedActions.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Uitgevoerde acties ({executedActions.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {executedActions.map((action) => (
                  <ExecutedActionRow key={action.id} action={action} />
                ))}
              </Box>
            </Box>
          )}
        </Box>
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

function DeviceInfoPanel({ device, hallName }: { device: Device; hallName: string | undefined }) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 3, borderRadius: '12px', borderColor: 'divider' }}
    >
      <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(21,101,192,0.1)', color: 'primary.main' }}>
        <CategoryIcon category={device.category} fontSize="medium" />
      </Avatar>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700 }}>
          {device.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {CATEGORY_LABELS[device.category]}
          {hallName ? ` · ${hallName}` : ''}
        </Typography>
        {device.serialNumber && (
          <Typography variant="body2" color="text.secondary">
            Serienummer: {device.serialNumber}
          </Typography>
        )}
        {device.description && <Typography variant="body2">{device.description}</Typography>}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          Positie: x {device.x}, y {device.y}
        </Typography>
      </Box>
    </Paper>
  )
}

function OpenActionRow({
  action,
  onMarkDone,
}: {
  action: MaintenanceAction
  onMarkDone: (action: MaintenanceAction) => void
}) {
  const theme = useTheme()
  const urgency = getUrgency(action)
  const accentColor =
    urgency === 'overdue' ? theme.palette.error.main : urgency === 'dueSoon' ? theme.palette.warning.main : 'transparent'

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ width: 4, flexShrink: 0, backgroundColor: accentColor }} />
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minWidth: 0,
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          py: 1.5,
          px: 2,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 600, textTransform: 'capitalize' }} noWrap>
            {action.type} · {formatDeadlineShort(action.deadline)}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {action.description}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
          }}
        >
          {urgency === 'overdue' && <Chip label="VERLOPEN" size="small" color="error" />}
          {urgency === 'dueSoon' && <Chip label="< 24 U" size="small" color="warning" />}
          {urgency === 'normal' && <Chip label="OPEN" size="small" variant="outlined" />}
          <Tooltip title="Markeer als uitgevoerd">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onMarkDone(action)}
              aria-label={`Markeer ${action.type} als uitgevoerd`}
            >
              <Check fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  )
}

function ExecutedActionRow({ action }: { action: MaintenanceAction }) {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 2 },
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'action.hover',
        py: 1.5,
        px: 2,
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'text.secondary' }} noWrap>
          {action.type} · uitgevoerd op {action.executedAt ? formatDeadlineShort(action.executedAt) : '—'}
        </Typography>
        {action.noteAfterExecution && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {action.noteAfterExecution}
          </Typography>
        )}
      </Box>
      <Chip label="UITGEVOERD" size="small" color="success" />
    </Paper>
  )
}
