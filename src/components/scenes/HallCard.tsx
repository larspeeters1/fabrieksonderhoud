import { Category, Assignment, Schedule, ErrorOutlineOutlined as ErrorOutline } from '@mui/icons-material'
import { Chip, Paper, Stack, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { Hall } from '../../model/types'
import type { HallStats } from '../../utils/hallStats'

interface HallCardProps {
  hall: Hall
  stats: HallStats
}

export default function HallCard({ hall, stats }: HallCardProps) {
  const navigate = useNavigate()
  const theme = useTheme()

  const borderColor =
    stats.overdueCount > 0
      ? theme.palette.error.main
      : stats.dueSoonCount > 0
        ? theme.palette.warning.main
        : theme.palette.divider

  return (
    <Paper
      onClick={() => navigate(`/halls/${hall.id}`)}
      elevation={2}
      sx={{
        position: 'absolute',
        left: hall.x,
        top: hall.y,
        width: hall.width,
        height: hall.height,
        p: 1.5,
        overflow: 'auto',
        borderRadius: 2,
        border: '2px solid',
        borderColor,
        backgroundColor: 'background.paper',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease-in-out',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <Typography variant="subtitle1" component="h2" noWrap title={hall.name} sx={{ mb: 1 }}>
        {hall.name}
      </Typography>
      <Stack direction="row" gap={0.5} sx={{ flexWrap: 'wrap' }}>
        <Chip
          size="small"
          icon={<Category />}
          label={`${stats.deviceCount} apparaten`}
        />
        <Chip
          size="small"
          variant="outlined"
          color="primary"
          icon={<Assignment />}
          label={`${stats.openCount} open`}
        />
        {stats.dueSoonCount > 0 && (
          <Chip
            size="small"
            color="warning"
            icon={<Schedule />}
            label={`${stats.dueSoonCount} binnen 24u`}
          />
        )}
        {stats.overdueCount > 0 && (
          <Chip
            size="small"
            color="error"
            icon={<ErrorOutline />}
            label={`${stats.overdueCount} verlopen`}
          />
        )}
      </Stack>
    </Paper>
  )
}
