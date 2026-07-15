import { useState } from 'react'
import { Check } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import { useCompleteAction } from '../../hooks/useCompleteAction'
import type { MaintenanceAction } from '../../model/types'
import { formatDeadlineLong } from '../../utils/dateUtils'

const NOTE_MAX_LENGTH = 500

interface CompleteActionDialogProps {
  action: MaintenanceAction | undefined
  open: boolean
  onClose: () => void
  onCompleted: () => void
  onError: () => void
}

// Reusable across US4 (device detail) and US5: callers only need to supply
// the action to complete plus success/error callbacks for their own
// feedback UI (e.g. a Snackbar) — this component owns the mutation itself.
export default function CompleteActionDialog({
  action,
  open,
  onClose,
  onCompleted,
  onError,
}: CompleteActionDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700 }}>Actie uitvoeren</DialogTitle>
      {/* Mounting/unmounting this form alongside `action` naturally resets the
          note field each time a (possibly different) action is opened, with
          no effect required to reset local state on prop changes. */}
      {action && <CompleteActionForm action={action} onClose={onClose} onCompleted={onCompleted} onError={onError} />}
    </Dialog>
  )
}

function CompleteActionForm({
  action,
  onClose,
  onCompleted,
  onError,
}: {
  action: MaintenanceAction
  onClose: () => void
  onCompleted: () => void
  onError: () => void
}) {
  const [note, setNote] = useState('')
  const { mutate, isPending } = useCompleteAction()

  const handleConfirm = () => {
    mutate(
      { id: action.id, note: note.trim() || undefined },
      {
        onSuccess: () => {
          onCompleted()
          onClose()
        },
        onError: () => onError(),
      },
    )
  }

  return (
    <>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
            {action.type} · deadline {formatDeadlineLong(action.deadline)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {action.description}
          </Typography>
        </Box>
        <TextField
          label="Opmerking (optioneel)"
          multiline
          minRows={3}
          fullWidth
          value={note}
          onChange={(event) => setNote(event.target.value.slice(0, NOTE_MAX_LENGTH))}
          helperText={`${note.length}/${NOTE_MAX_LENGTH}`}
          slotProps={{ htmlInput: { maxLength: NOTE_MAX_LENGTH } }}
          disabled={isPending}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Annuleren
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <Check />}
        >
          Markeer als uitgevoerd
        </Button>
      </DialogActions>
    </>
  )
}
