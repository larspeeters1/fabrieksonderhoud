import { ChevronRight } from '@mui/icons-material'
import { Avatar, Box, Chip, Paper, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUrgencyDisplay } from '../../hooks/useUrgencyDisplay'
import type { HallFilters } from '../../model/filters'
import type { Device, MaintenanceAction } from '../../model/types'
import { formatDeadlineShort } from '../../utils/dateUtils'
import { getNextMatchingAction } from '../../utils/filterUtils'
import CategoryIcon from './CategoryIcon'

interface DeviceListItemProps {
  device: Device
  actions: MaintenanceAction[]
  filters: HallFilters
}

export default function DeviceListItem({ device, actions, filters }: DeviceListItemProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const { urgencyOf, enabled } = useUrgencyDisplay()
  const nextAction = getNextMatchingAction(device.id, actions, filters)
  const urgency = urgencyOf(nextAction)

  const accentColor =
    urgency === 'overdue'
      ? theme.palette.error.main
      : urgency === 'dueSoon'
        ? theme.palette.warning.main
        : urgency === 'done' && enabled
          ? theme.palette.success.main
          : urgency === 'open' && enabled
            ? theme.palette.primary.main
            : 'transparent'

  return (
    <Paper
      component="button"
      onClick={() => navigate(`/devices/${device.id}`)}
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        textAlign: 'left',
        font: 'inherit',
        cursor: 'pointer',
        p: 0,
        overflow: 'hidden',
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        outline: 'none',
        transition: 'border-color 150ms ease',
        '&:hover': { borderColor: 'primary.main' },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box sx={{ width: 4, flexShrink: 0, backgroundColor: accentColor }} />

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minWidth: 0,
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          py: 1.5,
          px: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
          <Avatar sx={{ bgcolor: 'rgba(21,101,192,0.1)', color: 'primary.main' }}>
            <CategoryIcon category={device.category} fontSize="small" />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }} noWrap>
              {device.name}
            </Typography>
            {device.description && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {device.description}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
          }}
        >
          <Typography variant="body2" color="text.secondary" noWrap>
            {nextAction ? `${nextAction.type} · ${formatDeadlineShort(nextAction.deadline)}` : 'geen acties binnen filters'}
          </Typography>
          {nextAction && urgency === 'overdue' && <Chip label="VERLOPEN" size="small" color="error" />}
          {nextAction && urgency === 'dueSoon' && <Chip label="< 24 U" size="small" color="warning" />}
          {nextAction && urgency === 'open' && (
            <Chip label="OPEN" size="small" variant="outlined" color={enabled ? 'primary' : undefined} />
          )}
          {nextAction && urgency === 'done' && (
            <Chip label="UITGEVOERD" size="small" color={enabled ? 'success' : 'default'} />
          )}
          <ChevronRight color="action" />
        </Box>
      </Box>
    </Paper>
  )
}
