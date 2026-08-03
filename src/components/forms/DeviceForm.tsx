import { useState } from 'react'
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
  type SelectChangeEvent,
} from '@mui/material'
import { useCreateDevice } from '../../hooks/useCreateDevice'
import { useUpdateDevice } from '../../hooks/useUpdateDevice'
import type { Device, DeviceCategory } from '../../model/types'

const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  machine: 'Machine',
  band: 'Band',
  lamp: 'Lamp',
}

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
          all fields whenever a different device or a new click position comes in. */}
      {context && <DeviceFormFields context={context} onClose={onClose} onSaved={onSaved} onError={onError} />}
    </Dialog>
  )
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

  const [name, setName] = useState(isEdit ? context.device.name : '')
  const [category, setCategory] = useState<DeviceCategory>(isEdit ? context.device.category : 'machine')
  const [serialNumber, setSerialNumber] = useState(isEdit ? (context.device.serialNumber ?? '') : '')
  const [description, setDescription] = useState(isEdit ? (context.device.description ?? '') : '')
  const [x, setX] = useState(isEdit ? context.device.x : context.x)
  const [y, setY] = useState(isEdit ? context.device.y : context.y)

  const createDevice = useCreateDevice()
  const updateDevice = useUpdateDevice()
  const isPending = createDevice.isPending || updateDevice.isPending

  const nameError = name.trim().length === 0
  const canSubmit = !nameError && !isPending

  const handleSubmit = () => {
    if (!canSubmit) return
    const payload = {
      name: name.trim(),
      category,
      hallId,
      x,
      y,
      serialNumber: serialNumber.trim() || undefined,
      description: description.trim() || undefined,
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
    <>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Naam"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={nameError}
          helperText={nameError ? 'Naam is verplicht' : ' '}
          fullWidth
          autoFocus
        />
        <FormControl fullWidth>
          <InputLabel id="device-category-label">Categorie</InputLabel>
          <Select
            labelId="device-category-label"
            label="Categorie"
            value={category}
            onChange={(event: SelectChangeEvent) => setCategory(event.target.value as DeviceCategory)}
          >
            {(Object.keys(CATEGORY_LABELS) as DeviceCategory[]).map((cat) => (
              <MenuItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Positie X"
            type="number"
            value={x}
            onChange={(event) => setX(Number(event.target.value))}
            fullWidth
          />
          <TextField
            label="Positie Y"
            type="number"
            value={y}
            onChange={(event) => setY(Number(event.target.value))}
            fullWidth
          />
        </Box>
        <TextField
          label="Serienummer (optioneel)"
          value={serialNumber}
          onChange={(event) => setSerialNumber(event.target.value)}
          fullWidth
        />
        <TextField
          label="Omschrijving (optioneel)"
          multiline
          minRows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
          helperText={`${description.length}/${DESCRIPTION_MAX_LENGTH}`}
          fullWidth
        />
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
