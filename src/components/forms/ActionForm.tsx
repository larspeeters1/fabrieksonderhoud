import { Controller, useForm } from 'react-hook-form'
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
      {}
      {context && <ActionFormFields context={context} onClose={onClose} onSaved={onSaved} onError={onError} />}
    </Dialog>
  )
}

interface ActionFormValues {
  deviceId: string
  type: ActionType
  deadline: string
  status: ActionStatus
  executedAt: string
  description: string
  noteAfterExecution: string
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

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ActionFormValues>({
    mode: 'onTouched',
    defaultValues: isEdit
      ? {
          deviceId: context.action.deviceId,
          type: context.action.type,
          deadline: context.action.deadline,
          status: context.action.status,
          executedAt: context.action.executedAt ?? '',
          description: context.action.description,
          noteAfterExecution: context.action.noteAfterExecution ?? '',
        }
      : {
          deviceId: context.deviceId,
          type: 'controle',
          deadline: '',
          status: 'open',
          executedAt: '',
          description: '',
          noteAfterExecution: '',
        },
  })
  const status = watch('status')
  const description = watch('description')

  const createAction = useCreateAction()
  const updateAction = useUpdateAction()
  const isPending = createAction.isPending || updateAction.isPending

  const handleStatusChange = (nextStatus: ActionStatus, onChange: (value: ActionStatus) => void) => {
    onChange(nextStatus)
    if (nextStatus === 'open') {
      // Only makes sense alongside status 'uitgevoerd' — clear it so a
      // reopened action doesn't keep a stale execution date around.
      setValue('executedAt', '')
      setValue('noteAfterExecution', '')
    } else if (!getValues('executedAt')) {
      setValue('executedAt', getTodayISODate())
    }
  }

  const onSubmit = (values: ActionFormValues) => {
    const payload = {
      deviceId: values.deviceId,
      type: values.type,
      deadline: values.deadline,
      status: values.status,
      executedAt: values.status === 'uitgevoerd' ? values.executedAt || undefined : undefined,
      description: values.description.trim(),
      noteAfterExecution: values.status === 'uitgevoerd' ? values.noteAfterExecution.trim() || undefined : undefined,
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Controller
          name="deviceId"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="action-device-label">Apparaat</InputLabel>
              <Select
                {...field}
                labelId="action-device-label"
                label="Apparaat"
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
          )}
        />

        <Controller
          name="type"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="action-type-label">Type actie</InputLabel>
              <Select {...field} labelId="action-type-label" label="Type actie">
                {(Object.keys(ACTION_TYPE_LABELS) as ActionType[]).map((actionType) => (
                  <MenuItem key={actionType} value={actionType}>
                    {ACTION_TYPE_LABELS[actionType]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="deadline"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Deadline"
              type="date"
              error={Boolean(errors.deadline)}
              helperText={errors.deadline ? 'Deadline is verplicht' : ' '}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          )}
        />

        <Controller
          name="status"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="action-status-label">Status</InputLabel>
              <Select
                {...field}
                labelId="action-status-label"
                label="Status"
                onChange={(event) => handleStatusChange(event.target.value as ActionStatus, field.onChange)}
              >
                {(Object.keys(STATUS_LABELS) as ActionStatus[]).map((actionStatus) => (
                  <MenuItem key={actionStatus} value={actionStatus}>
                    {STATUS_LABELS[actionStatus]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        {status === 'uitgevoerd' && (
          <Controller
            name="executedAt"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Uitgevoerd op" type="date" slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            )}
          />
        )}

        <Controller
          name="description"
          control={control}
          rules={{
            required: 'Omschrijving is verplicht',
            maxLength: { value: DESCRIPTION_MAX_LENGTH, message: `Maximaal ${DESCRIPTION_MAX_LENGTH} tekens` },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Omschrijving"
              multiline
              minRows={2}
              error={Boolean(errors.description)}
              helperText={errors.description?.message ?? `${description.length}/${DESCRIPTION_MAX_LENGTH}`}
              fullWidth
            />
          )}
        />

        {status === 'uitgevoerd' && (
          <Controller
            name="noteAfterExecution"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Opmerking na uitvoering (optioneel)" multiline minRows={2} fullWidth />
            )}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Annuleren
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isEdit ? 'Opslaan' : 'Toevoegen'}
        </Button>
      </DialogActions>
    </form>
  )
}
