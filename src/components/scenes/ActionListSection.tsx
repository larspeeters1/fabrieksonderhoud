import { Check, Delete, Edit } from '@mui/icons-material'
import { Box, Chip, IconButton, Paper, Tooltip, Typography, useTheme } from '@mui/material'
import { useUrgencyDisplay } from '../../hooks/useUrgencyDisplay'
import type { MaintenanceAction } from '../../model/types'
import { formatDeadlineShort } from '../../utils/dateUtils'

interface ActionListSectionProps {
  title: string
  actions: MaintenanceAction[]
  variant: 'open' | 'uitgevoerd'
  onMarkDone?: (action: MaintenanceAction) => void
  onEdit?: (action: MaintenanceAction) => void
  onDelete?: (action: MaintenanceAction) => void
}

export default function ActionListSection({ title, actions, variant, onMarkDone, onEdit, onDelete }: ActionListSectionProps) {
  if (actions.length === 0) return null

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {title} ({actions.length})
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {actions.map((action) =>
          variant === 'open' ? (
            <OpenActionRow key={action.id} action={action} onMarkDone={onMarkDone} onEdit={onEdit} onDelete={onDelete} />
          ) : (
            <ExecutedActionRow key={action.id} action={action} onEdit={onEdit} onDelete={onDelete} />
          ),
        )}
      </Box>
    </Box>
  )
}

function OpenActionRow({
  action,
  onMarkDone,
  onEdit,
  onDelete,
}: {
  action: MaintenanceAction
  onMarkDone?: (action: MaintenanceAction) => void
  onEdit?: (action: MaintenanceAction) => void
  onDelete?: (action: MaintenanceAction) => void
}) {
  const theme = useTheme()
  const { urgencyOf, enabled } = useUrgencyDisplay()
  const urgency = urgencyOf(action)
  const accentColor =
    urgency === 'overdue'
      ? theme.palette.error.main
      : urgency === 'dueSoon'
        ? theme.palette.warning.main
        : urgency === 'open' && enabled
          ? theme.palette.primary.main
          : 'transparent'

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
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
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 600, textTransform: 'capitalize' }} noWrap>
            {action.type} · {formatDeadlineShort(action.deadline)}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {action.description}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
          }}
        >
          {urgency === 'overdue' && <Chip label="VERLOPEN" size="small" color="error" />}
          {urgency === 'dueSoon' && <Chip label="< 24 U" size="small" color="warning" />}
          {urgency === 'open' && <Chip label="OPEN" size="small" variant="outlined" color={enabled ? 'primary' : undefined} />}
          <Tooltip title="Markeer als uitgevoerd">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onMarkDone?.(action)}
              aria-label={`Markeer ${action.type} als uitgevoerd`}
            >
              <Check fontSize="small" />
            </IconButton>
          </Tooltip>
          {onEdit && (
            <Tooltip title="Actie bewerken">
              <IconButton size="small" onClick={() => onEdit(action)} aria-label={`Bewerk ${action.type}`}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Actie verwijderen">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(action)}
                aria-label={`Verwijder ${action.type}`}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

function ExecutedActionRow({
  action,
  onEdit,
  onDelete,
}: {
  action: MaintenanceAction
  onEdit?: (action: MaintenanceAction) => void
  onDelete?: (action: MaintenanceAction) => void
}) {
  const theme = useTheme()
  const { urgencyOf, enabled } = useUrgencyDisplay()
  const urgency = urgencyOf(action)
  const accentColor = urgency === 'done' && enabled ? theme.palette.success.main : 'transparent'

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'action.hover',
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
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'text.secondary' }} noWrap>
            {action.type} · uitgevoerd op {action.executedAt ? formatDeadlineShort(action.executedAt) : '—'}
          </Typography>
          {action.noteAfterExecution && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {action.noteAfterExecution}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Chip label="UITGEVOERD" size="small" color={enabled ? 'success' : 'default'} />
          {onEdit && (
            <Tooltip title="Actie bewerken">
              <IconButton size="small" onClick={() => onEdit(action)} aria-label={`Bewerk ${action.type}`}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Actie verwijderen">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(action)}
                aria-label={`Verwijder ${action.type}`}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Paper>
  )
}
