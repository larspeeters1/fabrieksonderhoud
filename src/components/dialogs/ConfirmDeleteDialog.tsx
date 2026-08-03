import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  description: string
  isPending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmDeleteDialog({
  open,
  title,
  description,
  isPending = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{description}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={isPending}>
          Annuleren
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Verwijderen
        </Button>
      </DialogActions>
    </Dialog>
  )
}
