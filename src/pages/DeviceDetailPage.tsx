import { useState } from 'react'
import { Add, ArrowBack, Check, Delete, Edit, MyLocation } from '@mui/icons-material'
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
import ConfirmDeleteDialog from '../components/dialogs/ConfirmDeleteDialog'
import ActionForm, { type ActionFormContext } from '../components/forms/ActionForm'
import DeviceForm from '../components/forms/DeviceForm'
import CategoryIcon from '../components/scenes/CategoryIcon'
import NextActionCard from '../components/scenes/NextActionCard'
import { useAuth } from '../hooks/useAuth'
import { useDeleteAction } from '../hooks/useDeleteAction'
import { useDeleteDevice } from '../hooks/useDeleteDevice'
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
  const { user } = useAuth()
  const isAdmin = user?.role === 'beheerder'

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

  // Device edit/delete (US7) — admin only.
  const [deviceFormOpen, setDeviceFormOpen] = useState(false)
  const [deletingDevice, setDeletingDevice] = useState(false)
  const deleteDeviceMutation = useDeleteDevice()

  const handleFormSaved = (message: string) => setSnackbar({ open: true, message, severity: 'success' })
  const handleFormError = (message: string) => setSnackbar({ open: true, message, severity: 'error' })

  const handleDeleteDeviceConfirm = () => {
    if (!device) return
    deleteDeviceMutation.mutate(device.id, {
      onSuccess: () => navigate(`/halls/${device.hallId}`),
      onError: () => setSnackbar({ open: true, message: 'Apparaat verwijderen is mislukt. Probeer opnieuw.', severity: 'error' }),
    })
  }

  // Action CRUD (US8) — admin only. The existing "markeer als uitgevoerd"
  // flow above (completingAction/CompleteActionDialog) is untouched; this is
  // the separate manual variant for full edit/delete/create.
  const [actionFormContext, setActionFormContext] = useState<ActionFormContext | undefined>(undefined)
  const [deletingAction, setDeletingAction] = useState<MaintenanceAction | undefined>(undefined)
  const deleteActionMutation = useDeleteAction()

  const handleAddAction = () => device && setActionFormContext({ mode: 'create', deviceId: device.id })
  const handleEditAction = (action: MaintenanceAction) => setActionFormContext({ mode: 'edit', action })
  const handleActionFormClose = () => setActionFormContext(undefined)

  const handleDeleteActionConfirm = () => {
    if (!deletingAction) return
    deleteActionMutation.mutate(deletingAction.id, {
      onSuccess: () => {
        setSnackbar({ open: true, message: 'Actie verwijderd', severity: 'success' })
        setDeletingAction(undefined)
      },
      onError: () => setSnackbar({ open: true, message: 'Actie verwijderen is mislukt. Probeer opnieuw.', severity: 'error' }),
    })
  }

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
          <DeviceInfoPanel
            device={device}
            hallName={hallQuery.data?.name}
            isAdmin={isAdmin}
            onEdit={() => setDeviceFormOpen(true)}
            onDelete={() => setDeletingDevice(true)}
          />

          {isAdmin && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<Add />} onClick={handleAddAction}>
                Actie toevoegen
              </Button>
            </Box>
          )}

          <NextActionCard
            action={nextAction}
            onMarkDone={handleMarkDone}
            isAdmin={isAdmin}
            onEdit={handleEditAction}
            onDelete={setDeletingAction}
          />

          {otherOpenActions.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Overige open acties ({otherOpenActions.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {otherOpenActions.map((action) => (
                  <OpenActionRow
                    key={action.id}
                    action={action}
                    onMarkDone={handleMarkDone}
                    isAdmin={isAdmin}
                    onEdit={handleEditAction}
                    onDelete={setDeletingAction}
                  />
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
                  <ExecutedActionRow
                    key={action.id}
                    action={action}
                    isAdmin={isAdmin}
                    onEdit={handleEditAction}
                    onDelete={setDeletingAction}
                  />
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

      <DeviceForm
        open={deviceFormOpen}
        context={device ? { mode: 'edit', device } : undefined}
        onClose={() => setDeviceFormOpen(false)}
        onSaved={handleFormSaved}
        onError={handleFormError}
      />

      <ConfirmDeleteDialog
        open={deletingDevice}
        title="Apparaat verwijderen"
        description={`Weet je zeker dat je "${device?.name}" wilt verwijderen? Alle bijhorende acties worden ook verwijderd.`}
        isPending={deleteDeviceMutation.isPending}
        onCancel={() => setDeletingDevice(false)}
        onConfirm={handleDeleteDeviceConfirm}
      />

      <ActionForm
        open={Boolean(actionFormContext)}
        context={actionFormContext}
        onClose={handleActionFormClose}
        onSaved={handleFormSaved}
        onError={handleFormError}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingAction)}
        title="Actie verwijderen"
        description={`Weet je zeker dat je de actie "${deletingAction?.description ?? ''}" wilt verwijderen?`}
        isPending={deleteActionMutation.isPending}
        onCancel={() => setDeletingAction(undefined)}
        onConfirm={handleDeleteActionConfirm}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

function DeviceInfoPanel({
  device,
  hallName,
  isAdmin,
  onEdit,
  onDelete,
}: {
  device: Device
  hallName: string | undefined
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
}) {
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
      {isAdmin && (
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 'auto' }}>
          <Tooltip title="Apparaat bewerken">
            <IconButton size="small" onClick={onEdit} aria-label="Apparaat bewerken">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Apparaat verwijderen">
            <IconButton size="small" color="error" onClick={onDelete} aria-label="Apparaat verwijderen">
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  )
}

function OpenActionRow({
  action,
  onMarkDone,
  isAdmin,
  onEdit,
  onDelete,
}: {
  action: MaintenanceAction
  onMarkDone: (action: MaintenanceAction) => void
  isAdmin: boolean
  onEdit: (action: MaintenanceAction) => void
  onDelete: (action: MaintenanceAction) => void
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
          {isAdmin && (
            <>
              <Tooltip title="Actie bewerken">
                <IconButton size="small" onClick={() => onEdit(action)} aria-label={`Bewerk ${action.type}`}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actie verwijderen">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(action)}
                  aria-label={`Verwijder ${action.type}`}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

function ExecutedActionRow({
  action,
  isAdmin,
  onEdit,
  onDelete,
}: {
  action: MaintenanceAction
  isAdmin: boolean
  onEdit: (action: MaintenanceAction) => void
  onDelete: (action: MaintenanceAction) => void
}) {
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Chip label="UITGEVOERD" size="small" color="success" />
        {isAdmin && (
          <>
            <Tooltip title="Actie bewerken">
              <IconButton size="small" onClick={() => onEdit(action)} aria-label={`Bewerk ${action.type}`}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Actie verwijderen">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(action)}
                aria-label={`Verwijder ${action.type}`}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Paper>
  )
}
