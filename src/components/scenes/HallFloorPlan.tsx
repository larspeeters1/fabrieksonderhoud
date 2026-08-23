import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { Box, Tooltip, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUrgencyDisplay } from '../../hooks/useUrgencyDisplay'
import type { HallFilters } from '../../model/filters'
import type { Device, Hall, MaintenanceAction } from '../../model/types'
import { formatDeadlineShort } from '../../utils/dateUtils'
import { getNextMatchingAction } from '../../utils/filterUtils'
import CategoryIcon from './CategoryIcon'

const MARGIN_X = 60
const MARGIN_TOP = 50
const MARGIN_BOTTOM = 90
const MIN_HEIGHT = 320
const CHIP_SIZE = 44

const MIN_SCALE = 1.2
const MAX_SCALE = 2.5
const MAX_PLAN_HEIGHT = 560

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

interface HallFloorPlanProps {
    hall: Hall
    devices: Device[]
    actions: MaintenanceAction[]
    filters: HallFilters
    highlightDeviceId?: string

    onCanvasClick?: (position: { x: number; y: number }) => void
}

export default function HallFloorPlan({
                                          hall,
                                          devices,
                                          actions,
                                          filters,
                                          highlightDeviceId,
                                          onCanvasClick,
                                      }: HallFloorPlanProps) {
    const viewportRef = useRef<HTMLDivElement>(null)
    const [availableWidth, setAvailableWidth] = useState(0)

    useLayoutEffect(() => {
        const element = viewportRef.current
        if (!element) return
        const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width))
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    const widthFit = availableWidth > 0 ? (availableWidth - MARGIN_X * 2) / hall.width : MAX_SCALE
    const heightFit = (MAX_PLAN_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM) / hall.height
    const scale = clamp(Math.min(widthFit, heightFit), MIN_SCALE, MAX_SCALE)

    const canvasWidth = hall.width * scale + MARGIN_X * 2
    const canvasHeight = Math.max(hall.height * scale + MARGIN_TOP + MARGIN_BOTTOM, MIN_HEIGHT)

    const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {

        if (!onCanvasClick || event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        const x = Math.round(hall.x + (event.clientX - rect.left - MARGIN_X) / scale)
        const y = Math.round(hall.y + (event.clientY - rect.top - MARGIN_TOP) / scale)
        onCanvasClick({ x: clamp(x, hall.x, hall.x + hall.width), y: clamp(y, hall.y, hall.y + hall.height) })
    }

    return (
        <Box
            ref={viewportRef}
            sx={{
                overflow: 'auto',
                borderRadius: '12px',
                backgroundColor: (theme) => theme.palette.blueprint.surface,
            }}
        >
            <Box
                onClick={handleCanvasClick}
                sx={{
                    position: 'relative',
                    width: canvasWidth,
                    height: canvasHeight,
                    backgroundImage: (theme) =>
                        `linear-gradient(to right, ${theme.palette.blueprint.gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${theme.palette.blueprint.gridLine} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    cursor: onCanvasClick ? 'crosshair' : 'default',
                }}
            >
                {devices.map((device) => (
                    <FloorPlanDeviceChip
                        key={device.id}
                        device={device}
                        hall={hall}
                        scale={scale}
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
                                 scale,
                                 action,
                                 isHighlighted,
                             }: {
    device: Device
    hall: Hall
    scale: number
    action: MaintenanceAction | undefined
    isHighlighted: boolean
}) {
    const theme = useTheme()
    const navigate = useNavigate()
    const { urgencyOf, enabled } = useUrgencyDisplay()
    const urgency = urgencyOf(action)
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (isHighlighted) {
            buttonRef.current?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
        }
    }, [isHighlighted])

    const left = MARGIN_X + (device.x - hall.x) * scale
    const top = MARGIN_TOP + (device.y - hall.y) * scale

    const ringColor = isHighlighted
        ? theme.palette.secondary.main
        : !enabled || !urgency
            ? theme.palette.blueprint.mutedIndicator
            : urgency === 'overdue'
                ? theme.palette.blueprint.urgentText
                : urgency === 'dueSoon'
                    ? theme.palette.warning.main
                    : urgency === 'done'
                        ? theme.palette.success.main
                        : theme.palette.blueprint.openText

    const labelColor = !action
        ? 'rgba(255,255,255,0.4)'
        : !enabled
            ? theme.palette.blueprint.mutedText
            : urgency === 'overdue'
                ? theme.palette.blueprint.urgentText
                : urgency === 'dueSoon'
                    ? theme.palette.warning.main
                    : urgency === 'done'
                        ? theme.palette.success.main
                        : theme.palette.blueprint.openText

    const actionLabel = !action
        ? 'geen acties binnen filters'
        : action.status === 'uitgevoerd'
            ? `✓ ${action.type} · ${formatDeadlineShort(action.executedAt ?? action.deadline)}`
            : `${action.type} · ${formatDeadlineShort(action.deadline)}`
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
                            '0%, 100%': { boxShadow: `0 0 0 0 ${theme.palette.blueprint.urgentText}55` },
                            '50%': { boxShadow: `0 0 0 6px ${theme.palette.blueprint.urgentText}00` },
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
