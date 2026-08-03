import { useState } from 'react'
import { Add, ArrowBack } from '@mui/icons-material'
import { Alert, Box, Button, IconButton, Skeleton, Snackbar, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import CompleteActionDialog from '../components/dialogs/CompleteActionDialog'
import ConfirmDeleteDialog from '../components/dialogs/ConfirmDeleteDialog'
import ActionForm, { type ActionFormContext } from '../components/forms/ActionForm'
import DeviceForm from '../components/forms/DeviceForm'
import ActionListSection from '../components/scenes/ActionListSection'
import DeviceInfoPanel from '../components/scenes/DeviceInfoPanel'
import NextActionCard from '../components/scenes/NextActionCard'
import { useAuth } from '../hooks/useAuth'
import { useDeleteAction } from '../hooks/useDeleteAction'
import { useDeleteDevice } from '../hooks/useDeleteDevice'
import { useDevice } from '../hooks/useDevice'
import { useDeviceActions } from '../hooks/useDeviceActions'
import { useHall } from '../hooks/useHall'
import type { MaintenanceAction } from '../model/types'
import { splitDeviceActions } from '../utils/actionUtils'

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
            onShowOnMap={() => navigate(`/halls/${device.hallId}?highlight=${device.id}`)}
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

          <ActionListSection
            title="Overige open acties"
            actions={otherOpenActions}
            variant="open"
            onMarkDone={handleMarkDone}
            onEdit={isAdmin ? handleEditAction : undefined}
            onDelete={isAdmin ? setDeletingAction : undefined}
          />

          <ActionListSection
            title="Uitgevoerde acties"
            actions={executedActions}
            variant="uitgevoerd"
            onEdit={isAdmin ? handleEditAction : undefined}
            onDelete={isAdmin ? setDeletingAction : undefined}
          />
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
