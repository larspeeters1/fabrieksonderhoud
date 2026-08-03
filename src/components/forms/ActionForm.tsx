import { useState } from 'react'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from '@mui/material'
import { useCreateAction } from '../../hooks/useCreateAction'
import { useDevices } from '../../hooks/useDevices'
import { useHalls } from '../../hooks/useHalls'
import { useUpdateAction } from '../../hooks/useUpdateAction'
import type { ActionStatus, ActionType, MaintenanceAction } from '../../model/types'
import { getTodayISODate } from '../../utils/dateUtils'

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  controle: 'Controle',
  vervanging: 'Vervanging',
  herstelling: 'Herstelling',
}

const STATUS_LABELS: Record<ActionStatus, string> = {
  open: 'Open',
  uitgevoerd: 'Uitgevoerd',
}

const DESCRIPTION_MAX_LENGTH = 500

export type ActionFormContext = { mode: 'edit'; action: MaintenanceAction } | { mode: 'create'; deviceId: string }

interface ActionFormProps {
  open: boolean
  onClose: () => void
  context: ActionFormContext | undefined
  onSaved: (message: string) => void
  onError: (message: string) => void
}

export default function ActionForm({ open, onClose, context, onSaved, onError }: ActionFormProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700 }}>
        {context?.mode === 'edit' ? 'Actie bewerken' : 'Actie toevoegen'}
      </DialogTitle>
      {/* Mounting fresh per context resets all fields whenever a different
          action is opened, with no effect needed to sync on prop changes. */}
      {context && <ActionFormFields context={context} onClose={onClose} onSaved={onSaved} onError={onError} />}
    </Dialog>
  )
}

function ActionFormFields({
  context,
  onClose,
  onSaved,
  onError,
}: {
  context: ActionFormContext
  onClose: () => void
  onSaved: (message: string) => void
  onError: (message: string) => void
}) {
  const isEdit = context.mode === 'edit'
  const devicesQuery = useDevices()
  const hallsQuery = useHalls()
  const devices = devicesQuery.data ?? []
  const halls = hallsQuery.data ?? []

  const [deviceId, setDeviceId] = useState(isEdit ? context.action.deviceId : context.deviceId)
  const [type, setType] = useState<ActionType>(isEdit ? context.action.type : 'controle')
  const [deadline, setDeadline] = useState(isEdit ? context.action.deadline : '')
  const [status, setStatus] = useState<ActionStatus>(isEdit ? context.action.status : 'open')
  const [executedAt, setExecutedAt] = useState(isEdit ? (context.action.executedAt ?? '') : '')
  const [description, setDescription] = useState(isEdit ? context.action.description : '')
  const [noteAfterExecution, setNoteAfterExecution] = useState(
    isEdit ? (context.action.noteAfterExecution ?? '') : '',
  )

  const createAction = useCreateAction()
  const updateAction = useUpdateAction()
  const isPending = createAction.isPending || updateAction.isPending

  const descriptionError = description.trim().length === 0
  const canSubmit = Boolean(deviceId) && Boolean(deadline) && !descriptionError && !isPending

  const handleStatusChange = (event: SelectChangeEvent) => {
    const nextStatus = event.target.value as ActionStatus
    setStatus(nextStatus)
    if (nextStatus === 'open') {
      // Only makes sense alongside status 'uitgevoerd' — clear it so a
      // reopened action doesn't keep a stale execution date around.
      setExecutedAt('')
      setNoteAfterExecution('')
    } else if (!executedAt) {
      setExecutedAt(getTodayISODate())
    }
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    const payload = {
      deviceId,
      type,
      deadline,
      status,
      executedAt: status === 'uitgevoerd' ? executedAt || undefined : undefined,
      description: description.trim(),
      noteAfterExecution: status === 'uitgevoerd' ? noteAfterExecution.trim() || undefined : undefined,
    }

    const mutation = isEdit
      ? updateAction.mutateAsync({ id: context.action.id, action: payload })
      : createAction.mutateAsync(payload)

    mutation
      .then(() => {
        onSaved(isEdit ? 'Actie bijgewerkt' : 'Actie toegevoegd')
        onClose()
      })
      .catch(() =>
        onError(isEdit ? 'Actie bijwerken is mislukt. Probeer opnieuw.' : 'Actie toevoegen is mislukt. Probeer opnieuw.'),
      )
  }

  return (
    <>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormControl fullWidth>
          <InputLabel id="action-device-label">Apparaat</InputLabel>
          <Select
            labelId="action-device-label"
            label="Apparaat"
            value={deviceId}
            onChange={(event: SelectChangeEvent) => setDeviceId(event.target.value)}
            renderValue={(value) => devices.find((device) => device.id === value)?.name ?? ''}
          >
            {halls.flatMap((hall) => {
              const hallDevices = devices.filter((device) => device.hallId === hall.id)
              if (hallDevices.length === 0) return []
              return [
                <ListSubheader key={hall.id}>{hall.name}</ListSubheader>,
                ...hallDevices.map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    {device.name}
                  </MenuItem>
                )),
              ]
            })}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="action-type-label">Type actie</InputLabel>
          <Select
            labelId="action-type-label"
            label="Type actie"
            value={type}
            onChange={(event: SelectChangeEvent) => setType(event.target.value as ActionType)}
          >
            {(Object.keys(ACTION_TYPE_LABELS) as ActionType[]).map((actionType) => (
              <MenuItem key={actionType} value={actionType}>
                {ACTION_TYPE_LABELS[actionType]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Deadline"
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="action-status-label">Status</InputLabel>
          <Select labelId="action-status-label" label="Status" value={status} onChange={handleStatusChange}>
            {(Object.keys(STATUS_LABELS) as ActionStatus[]).map((actionStatus) => (
              <MenuItem key={actionStatus} value={actionStatus}>
                {STATUS_LABELS[actionStatus]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {status === 'uitgevoerd' && (
          <TextField
            label="Uitgevoerd op"
            type="date"
            value={executedAt}
            onChange={(event) => setExecutedAt(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        )}

        <TextField
          label="Omschrijving"
          multiline
          minRows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
          error={descriptionError}
          helperText={`${description.length}/${DESCRIPTION_MAX_LENGTH}`}
          fullWidth
        />

        {status === 'uitgevoerd' && (
          <TextField
            label="Opmerking na uitvoering (optioneel)"
            multiline
            minRows={2}
            value={noteAfterExecution}
            onChange={(event) => setNoteAfterExecution(event.target.value)}
            fullWidth
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Annuleren
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isEdit ? 'Opslaan' : 'Toevoegen'}
        </Button>
      </DialogActions>
    </>
  )
}
