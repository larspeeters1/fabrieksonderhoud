// Every field here is a MUI component (TextField, Select), not a plain
// <input>. react-hook-form's register() works by attaching a ref directly to
// a native form element, but MUI components don't forward that ref to their
// underlying <input> in a way register() can drive — they're controlled
// components with their own value/onChange contract. Controller renders each
// field itself and wires MUI's value/onChange to RHF's field state instead of
// relying on an exposed DOM ref, which is why every field below uses it
// rather than register() ("render isolation" for UI libraries without ref
// passthrough).
import { Controller, useForm } from 'react-hook-form'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { useCreateDevice } from '../../hooks/useCreateDevice'
import { useUpdateDevice } from '../../hooks/useUpdateDevice'
import type { Device, DeviceCategory } from '../../model/types'

const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  machine: 'Machine',
  band: 'Band',
  lamp: 'Lamp',
}

const NAME_MAX_LENGTH = 40
const DESCRIPTION_MAX_LENGTH = 500

// Editing never reassigns a device to a different hall — its x/y are
// positions within that hall's floor plan, so moving halls would leave them
// meaningless. Creating always starts from a click on a specific hall's
// floor plan, which is where hallId/x/y come from.
export type DeviceFormContext =
  | { mode: 'edit'; device: Device }
  | { mode: 'create'; hallId: string; x: number; y: number }

interface DeviceFormProps {
  open: boolean
  onClose: () => void
  context: DeviceFormContext | undefined
  onSaved: (message: string) => void
  onError: (message: string) => void
}

export default function DeviceForm({ open, onClose, context, onSaved, onError }: DeviceFormProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700 }}>
        {context?.mode === 'edit' ? 'Apparaat bewerken' : 'Apparaat toevoegen'}
      </DialogTitle>
      {/* Mounting fresh per context (rather than syncing via an effect) resets
          all fields whenever a different device or a new click position comes
          in — the page always clears context to undefined between opens, so
          this component never survives across two different contexts. */}
      {context && <DeviceFormFields context={context} onClose={onClose} onSaved={onSaved} onError={onError} />}
    </Dialog>
  )
}

interface DeviceFormValues {
  name: string
  category: DeviceCategory
  x: number
  y: number
  serialNumber: string
  description: string
}

function DeviceFormFields({
  context,
  onClose,
  onSaved,
  onError,
}: {
  context: DeviceFormContext
  onClose: () => void
  onSaved: (message: string) => void
  onError: (message: string) => void
}) {
  const isEdit = context.mode === 'edit'
  const hallId = isEdit ? context.device.hallId : context.hallId

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DeviceFormValues>({
    mode: 'onTouched',
    defaultValues: isEdit
      ? {
          name: context.device.name,
          category: context.device.category,
          x: context.device.x,
          y: context.device.y,
          serialNumber: context.device.serialNumber ?? '',
          description: context.device.description ?? '',
        }
      : {
          name: '',
          category: 'machine',
          x: context.x,
          y: context.y,
          serialNumber: '',
          description: '',
        },
  })
  const descriptionLength = watch('description').length

  const createDevice = useCreateDevice()
  const updateDevice = useUpdateDevice()
  const isPending = createDevice.isPending || updateDevice.isPending

  const onSubmit = (values: DeviceFormValues) => {
    const payload = {
      name: values.name.trim(),
      category: values.category,
      hallId,
      x: values.x,
      y: values.y,
      serialNumber: values.serialNumber.trim() || undefined,
      description: values.description.trim() || undefined,
    }

    const mutation = isEdit
      ? updateDevice.mutateAsync({ id: context.device.id, device: payload })
      : createDevice.mutateAsync(payload)

    mutation
      .then(() => {
        onSaved(isEdit ? 'Apparaat bijgewerkt' : 'Apparaat toegevoegd')
        onClose()
      })
      .catch(() =>
        onError(isEdit ? 'Apparaat bijwerken is mislukt. Probeer opnieuw.' : 'Apparaat toevoegen is mislukt. Probeer opnieuw.'),
      )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Naam is verplicht', maxLength: { value: NAME_MAX_LENGTH, message: `Maximaal ${NAME_MAX_LENGTH} tekens` } }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Naam"
              error={Boolean(errors.name)}
              helperText={errors.name?.message ?? `${field.value.length}/${NAME_MAX_LENGTH}`}
              fullWidth
              autoFocus
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="device-category-label">Categorie</InputLabel>
              <Select {...field} labelId="device-category-label" label="Categorie">
                {(Object.keys(CATEGORY_LABELS) as DeviceCategory[]).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="x"
            control={control}
            rules={{ required: true, validate: (value) => !Number.isNaN(value) || 'Positie X moet een getal zijn' }}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(event) => field.onChange(event.target.valueAsNumber)}
                label="Positie X"
                type="number"
                error={Boolean(errors.x)}
                helperText={errors.x?.message}
                fullWidth
              />
            )}
          />
          <Controller
            name="y"
            control={control}
            rules={{ required: true, validate: (value) => !Number.isNaN(value) || 'Positie Y moet een getal zijn' }}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(event) => field.onChange(event.target.valueAsNumber)}
                label="Positie Y"
                type="number"
                error={Boolean(errors.y)}
                helperText={errors.y?.message}
                fullWidth
              />
            )}
          />
        </Box>

        <Controller
          name="serialNumber"
          control={control}
          render={({ field }) => <TextField {...field} label="Serienummer (optioneel)" fullWidth />}
        />

        <Controller
          name="description"
          control={control}
          rules={{ maxLength: { value: DESCRIPTION_MAX_LENGTH, message: `Maximaal ${DESCRIPTION_MAX_LENGTH} tekens` } }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Omschrijving (optioneel)"
              multiline
              minRows={2}
              error={Boolean(errors.description)}
              helperText={errors.description?.message ?? `${descriptionLength}/${DESCRIPTION_MAX_LENGTH}`}
              fullWidth
            />
          )}
        />
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
