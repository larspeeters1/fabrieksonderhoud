import { Check, LocationOn } from '@mui/icons-material'
import { Avatar, Box, Button, Chip, Paper, Typography, useTheme } from '@mui/material'
import type { Device, DeviceCategory, MaintenanceAction } from '../../model/types'
import { getUrgency } from '../../utils/actionUtils'
import { formatDeadlineLong } from '../../utils/dateUtils'
import CategoryIcon from './CategoryIcon'

const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  machine: 'Machine',
  band: 'Band',
  lamp: 'Lamp',
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

interface InspectionStepCardProps {
  device: Device
  action: MaintenanceAction
  isDone: boolean
  completedAt?: Date
  onMarkDone: () => void
  onShowOnMap: () => void
}

// The single focus card the inspector spends nearly all their time on —
// this is used on a tablet/phone walking through a factory hall, so
// everything is oversized: big text, a full-width primary button with a
// tall tap target, generous spacing.
export default function InspectionStepCard({
  device,
  action,
  isDone,
  completedAt,
  onMarkDone,
  onShowOnMap,
}: InspectionStepCardProps) {
  const theme = useTheme()
  const urgency = getUrgency(action)
  const urgencyColor = isDone
    ? theme.palette.success.main
    : urgency === 'overdue'
      ? theme.palette.error.main
      : urgency === 'dueSoon'
        ? theme.palette.warning.main
        : theme.palette.primary.main

  const executedLabel = completedAt
    ? `Uitgevoerd om ${formatTime(completedAt)}`
    : action.executedAt
      ? `Uitgevoerd op ${formatDeadlineLong(action.executedAt)}`
      : 'Uitgevoerd'

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 640,
        mx: 'auto',
        borderRadius: '16px',
        border: '2px solid',
        borderColor: urgencyColor,
        backgroundColor: isDone ? 'action.hover' : 'background.paper',
        opacity: isDone ? 0.8 : 1,
        p: { xs: 2.5, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        transition: 'border-color 200ms ease, opacity 200ms ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(21,101,192,0.1)', color: 'primary.main', flexShrink: 0 }}>
          <CategoryIcon category={device.category} fontSize="large" />
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontFamily: '"Archivo", sans-serif',
              fontWeight: 700,
              fontSize: { xs: '1.4rem', sm: '1.75rem' },
              lineHeight: 1.2,
            }}
          >
            {device.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {CATEGORY_LABELS[device.category]}
            {device.serialNumber ? ` · ${device.serialNumber}` : ''}
          </Typography>
        </Box>
        {isDone && <Chip label="UITGEVOERD" color="success" sx={{ fontWeight: 700 }} />}
        {!isDone && urgency === 'overdue' && <Chip label="VERLOPEN" color="error" sx={{ fontWeight: 700 }} />}
        {!isDone && urgency === 'dueSoon' && <Chip label="< 24 U" color="warning" sx={{ fontWeight: 700 }} />}
        {!isDone && urgency === 'normal' && <Chip label="OPEN" variant="outlined" sx={{ fontWeight: 700 }} />}
      </Box>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2.5 }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '1px',
            color: isDone ? 'text.secondary' : urgencyColor,
            textTransform: 'uppercase',
            mb: 1,
          }}
        >
          {isDone ? 'Uitgevoerde actie' : 'Uit te voeren'}
        </Typography>
        <Typography
          sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700, fontSize: { xs: '1.3rem', sm: '1.6rem' }, textTransform: 'capitalize' }}
        >
          {action.type}
        </Typography>
        <Typography sx={{ fontWeight: 600, color: isDone ? 'text.secondary' : urgencyColor, mt: 0.5, fontSize: '1.05rem' }}>
          Deadline: {formatDeadlineLong(action.deadline)}
          {!isDone && urgency === 'overdue' ? ' (verlopen)' : ''}
        </Typography>
        <Typography sx={{ mt: 2, fontSize: '1.05rem' }} color="text.secondary">
          {action.description}
        </Typography>
      </Box>

      {isDone ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            borderRadius: '10px',
            backgroundColor: 'rgba(46,125,50,0.12)',
            border: '1px solid',
            borderColor: 'success.main',
          }}
        >
          <Check color="success" />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: 'success.dark' }}>{executedLabel}</Typography>
            {action.noteAfterExecution && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {action.noteAfterExecution}
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Button
          variant="contained"
          color="success"
          startIcon={<Check />}
          onClick={onMarkDone}
          sx={{ height: 56, fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px' }}
        >
          Markeer als uitgevoerd
        </Button>
      )}

      <Button
        variant="outlined"
        startIcon={<LocationOn />}
        onClick={onShowOnMap}
        sx={{ height: 48, fontSize: '1rem', borderRadius: '10px' }}
      >
        Toon op plattegrond
      </Button>
    </Paper>
  )
}
