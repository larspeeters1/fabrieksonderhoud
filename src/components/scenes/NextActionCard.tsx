import { Check, CheckCircleOutlined, Delete, Edit } from '@mui/icons-material'
import { Box, Button, Chip, IconButton, Paper, Tooltip, Typography, useTheme } from '@mui/material'
import { useUrgencyDisplay } from '../../hooks/useUrgencyDisplay'
import type { MaintenanceAction } from '../../model/types'
import { formatDeadlineLong } from '../../utils/dateUtils'

interface NextActionCardProps {
  action: MaintenanceAction | undefined
  onMarkDone: (action: MaintenanceAction) => void
  isAdmin?: boolean
  onEdit?: (action: MaintenanceAction) => void
  onDelete?: (action: MaintenanceAction) => void
}

export default function NextActionCard({ action, onMarkDone, isAdmin = false, onEdit, onDelete }: NextActionCardProps) {
  const theme = useTheme()
  const { urgencyOf } = useUrgencyDisplay()

  if (!action) {
    return (
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 3,
          borderRadius: '12px',
          border: '2px solid',
          borderColor: 'success.main',
          backgroundColor: 'rgba(46,125,50,0.08)',
        }}
      >
        <CheckCircleOutlined color="success" sx={{ fontSize: 32 }} />
        <Typography variant="h6" sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700 }}>
          Alles uitgevoerd
        </Typography>
      </Paper>
    )
  }

  const urgency = urgencyOf(action)
  const urgencyColor =
    urgency === 'overdue'
      ? theme.palette.error.main
      : urgency === 'dueSoon'
        ? theme.palette.warning.main
        : theme.palette.primary.main
  const buttonColor = urgency === 'overdue' ? 'error' : urgency === 'dueSoon' ? 'warning' : 'primary'

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '12px',
        border: '2px solid',
        borderColor: urgencyColor,
        backgroundColor: `${urgencyColor}14`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1px',
            color: urgencyColor,
            textTransform: 'uppercase',
          }}
        >
          Eerstvolgende open actie
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {urgency === 'overdue' && <Chip label="VERLOPEN" size="small" color="error" />}
          {urgency === 'dueSoon' && <Chip label="< 24 U" size="small" color="warning" />}
          {urgency === 'normal' && <Chip label="OPEN" size="small" variant="outlined" />}
          {isAdmin && (
            <>
              <Tooltip title="Actie bewerken">
                <IconButton size="small" onClick={() => onEdit?.(action)} aria-label={`Bewerk ${action.type}`}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actie verwijderen">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete?.(action)}
                  aria-label={`Verwijder ${action.type}`}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      <Typography variant="h5" sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700, textTransform: 'capitalize' }}>
        {action.type} · deadline {formatDeadlineLong(action.deadline)}
      </Typography>
      <Typography sx={{ mt: 1, mb: 2.5 }} color="text.secondary">
        {action.description}
      </Typography>

      <Button variant="contained" color={buttonColor} startIcon={<Check />} onClick={() => onMarkDone(action)}>
        Markeer als uitgevoerd
      </Button>
    </Paper>
  )
}
