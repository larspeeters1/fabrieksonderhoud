import { Check, CheckCircleOutlined } from '@mui/icons-material'
import { Box, Button, Chip, Paper, Typography, useTheme } from '@mui/material'
import type { MaintenanceAction } from '../../model/types'
import { getUrgency } from '../../utils/actionUtils'
import { formatDeadlineLong } from '../../utils/dateUtils'

interface NextActionCardProps {
  action: MaintenanceAction | undefined
  onMarkDone: (action: MaintenanceAction) => void
}

export default function NextActionCard({ action, onMarkDone }: NextActionCardProps) {
  const theme = useTheme()

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

  const urgency = getUrgency(action)
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
        {urgency === 'overdue' && <Chip label="VERLOPEN" size="small" color="error" />}
        {urgency === 'dueSoon' && <Chip label="< 24 U" size="small" color="warning" />}
        {urgency === 'normal' && <Chip label="OPEN" size="small" variant="outlined" />}
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
