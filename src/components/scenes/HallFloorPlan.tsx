import { useEffect, useRef } from 'react'
import { Box, Tooltip, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { HallFilters } from '../../model/filters'
import type { Device, Hall, MaintenanceAction } from '../../model/types'
import { getUrgency } from '../../utils/actionUtils'
import { formatDeadlineShort } from '../../utils/dateUtils'
import { getNextMatchingAction } from '../../utils/filterUtils'
import CategoryIcon from './CategoryIcon'

const FLOOR_SCALE = 2.5
const MARGIN_X = 60
const MARGIN_TOP = 50
const MARGIN_BOTTOM = 90
const MIN_HEIGHT = 320
const CHIP_SIZE = 44
const URGENT_RED = '#FF6B6B'

interface HallFloorPlanProps {
  hall: Hall
  devices: Device[]
  actions: MaintenanceAction[]
  filters: HallFilters
  highlightDeviceId?: string
}

export default function HallFloorPlan({ hall, devices, actions, filters, highlightDeviceId }: HallFloorPlanProps) {
  const canvasWidth = hall.width * FLOOR_SCALE + MARGIN_X * 2
  const canvasHeight = Math.max(hall.height * FLOOR_SCALE + MARGIN_TOP + MARGIN_BOTTOM, MIN_HEIGHT)

  return (
    <Box
      sx={{
        overflow: 'auto',
        borderRadius: '12px',
        backgroundColor: (theme) => theme.palette.siteMap.background,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: canvasWidth,
          height: canvasHeight,
          backgroundImage: (theme) =>
            `linear-gradient(to right, ${theme.palette.siteMap.gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${theme.palette.siteMap.gridLine} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      >
        {devices.map((device) => (
          <FloorPlanDeviceChip
            key={device.id}
            device={device}
            hall={hall}
            action={getNextMatchingAction(device.id, actions, filters)}
            isHighlighted={device.id === highlightDeviceId}
          />
        ))}
      </Box>
    </Box>
  )
}

function FloorPlanDeviceChip({
  device,
  hall,
  action,
  isHighlighted,
}: {
  device: Device
  hall: Hall
  action: MaintenanceAction | undefined
  isHighlighted: boolean
}) {
  const theme = useTheme()
  const navigate = useNavigate()
  const urgency = getUrgency(action)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isHighlighted) {
      buttonRef.current?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    }
  }, [isHighlighted])

  const left = MARGIN_X + (device.x - hall.x) * FLOOR_SCALE
  const top = MARGIN_TOP + (device.y - hall.y) * FLOOR_SCALE

  const ringColor = isHighlighted
    ? theme.palette.secondary.main
    : urgency === 'overdue'
      ? URGENT_RED
      : urgency === 'dueSoon'
        ? theme.palette.warning.main
        : 'rgba(255,255,255,0.25)'

  const labelColor = !action
    ? 'rgba(255,255,255,0.4)'
    : urgency === 'overdue'
      ? URGENT_RED
      : urgency === 'dueSoon'
        ? theme.palette.warning.main
        : 'rgba(255,255,255,0.6)'

  const actionLabel = action ? `${action.type} · ${formatDeadlineShort(action.deadline)}` : 'geen acties binnen filters'
  const tooltipTitle = action ? `${device.name} — ${action.description}` : device.name

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box
        component="button"
        ref={buttonRef}
        onClick={() => navigate(`/devices/${device.id}`)}
        sx={{
          position: 'absolute',
          left,
          top,
          zIndex: isHighlighted ? 2 : 1,
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 130,
          background: 'none',
          border: 'none',
          font: 'inherit',
          p: 0,
          cursor: 'pointer',
          outline: 'none',
          '&:hover .floor-plan-chip': {
            backgroundColor: 'rgba(255,255,255,0.16)',
          },
          '&:focus-visible .floor-plan-chip': {
            outline: `2px solid ${theme.palette.primary.light}`,
            outlineOffset: 2,
          },
        }}
      >
        <Box
          className="floor-plan-chip"
          sx={{
            width: CHIP_SIZE,
            height: CHIP_SIZE,
            flexShrink: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: `${isHighlighted ? 3 : 2}px solid ${ringColor}`,
            transform: isHighlighted ? 'scale(1.2)' : 'scale(1)',
            transition: 'background-color 150ms ease, transform 200ms ease',
            animation: isHighlighted
              ? 'floor-chip-highlight-pulse 1.4s ease-in-out infinite'
              : urgency === 'overdue'
                ? 'floor-chip-pulse 2s ease-in-out infinite'
                : 'none',
            '@keyframes floor-chip-pulse': {
              '0%, 100%': { boxShadow: `0 0 0 0 ${URGENT_RED}55` },
              '50%': { boxShadow: `0 0 0 6px ${URGENT_RED}00` },
            },
            '@keyframes floor-chip-highlight-pulse': {
              '0%, 100%': { boxShadow: `0 0 0 0 ${theme.palette.secondary.main}66` },
              '50%': { boxShadow: `0 0 0 10px ${theme.palette.secondary.main}00` },
            },
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              animation: 'none',
            },
          }}
        >
          <CategoryIcon category={device.category} sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Typography
          noWrap
          sx={{ mt: 0.75, fontSize: 11, color: 'rgba(255,255,255,0.8)', maxWidth: '100%' }}
        >
          {device.name}
        </Typography>
        <Typography noWrap sx={{ fontSize: 10, color: labelColor, maxWidth: '100%' }}>
          {actionLabel}
        </Typography>
      </Box>
    </Tooltip>
  )
}
