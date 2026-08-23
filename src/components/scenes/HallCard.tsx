import { Box, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUrgencyDisplay } from '../../hooks/useUrgencyDisplay'
import type { Hall } from '../../model/types'
import type { HallDeviceMarker, HallStats } from '../../utils/hallStats'

interface HallCardProps {
    hall: Hall
    stats: HallStats
    deviceMarkers: HallDeviceMarker[]
}

const SMALL_HALL_WIDTH = 260
const SMALL_HALL_HEIGHT = 200
const MARKER_LAYER_MIN_HEIGHT = 140

export default function HallCard({ hall, stats: rawStats, deviceMarkers }: HallCardProps) {
    const navigate = useNavigate()
    const theme = useTheme()
    const { enabled, displayStats, displayUrgency } = useUrgencyDisplay()
    const stats = displayStats(rawStats)

    const statusColor =
        stats.overdueCount > 0
            ? theme.palette.error.main
            : stats.dueSoonCount > 0
                ? theme.palette.warning.main
                : theme.palette.success.main

    const isPulsing = stats.overdueCount > 0
    const isSmall = hall.width < SMALL_HALL_WIDTH || hall.height < SMALL_HALL_HEIGHT
    const showMarkerLayer = hall.height >= MARKER_LAYER_MIN_HEIGHT


    const markerColor = (urgency: HallDeviceMarker['urgency']) => {
        const displayedUrgency = displayUrgency(urgency)
        switch (displayedUrgency) {
            case 'overdue':
                return theme.palette.blueprint.urgentText
            case 'dueSoon':
                return theme.palette.warning.main

            case 'done':
                return enabled ? theme.palette.success.main : theme.palette.blueprint.mutedIndicator
            case 'open':
                return enabled ? theme.palette.primary.light : theme.palette.blueprint.mutedIndicator
            default:
                return theme.palette.blueprint.mutedIndicator
        }
    }

    const urgencyBlock =
        stats.overdueCount > 0
            ? { label: 'VERLOPEN', value: stats.overdueCount, color: theme.palette.blueprint.urgentText }
            : stats.dueSoonCount > 0
                ? { label: '< 24 U', value: stats.dueSoonCount, color: theme.palette.warning.main }
                : { label: 'OPEN', value: stats.openCount, color: '#fff' }

    const actionBlocks = isSmall
        ? [urgencyBlock]
        : [
            { label: 'OPEN', value: stats.openCount, color: '#fff' },
            ...(stats.dueSoonCount > 0
                ? [{ label: '< 24 U', value: stats.dueSoonCount, color: theme.palette.warning.main }]
                : []),
            ...(stats.overdueCount > 0
                ? [{ label: 'VERLOPEN', value: stats.overdueCount, color: theme.palette.blueprint.urgentText }]
                : []),
        ]

    return (
        <Box
            component="button"
            onClick={() => navigate(`/halls/${hall.id}`)}
            sx={{
                position: 'absolute',
                left: hall.x,
                top: hall.y,
                width: hall.width,
                height: hall.height,
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                font: 'inherit',
                appearance: 'none',
                p: 0,
                overflow: 'hidden',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: theme.palette.blueprint.panelBorder,
                backgroundColor: theme.palette.blueprint.panel,
                backdropFilter: 'blur(6px)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 150ms ease, transform 150ms ease',
                '&:hover': {
                    borderColor: theme.palette.blueprint.panelBorderHover,
                    transform: 'translateY(-2px)',
                },
                '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.light}`,
                    outlineOffset: 2,
                },
                '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                    '&:hover': {
                        transform: 'none',
                    },
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%', p: 1.5, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, width: '100%' }}>
                    <Typography
                        variant="subtitle1"
                        component="h2"
                        noWrap
                        title={hall.name}
                        sx={{
                            color: '#fff',
                            fontFamily: '"Archivo", sans-serif',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            fontSize: '1.05rem',
                        }}
                    >
                        {hall.name}
                    </Typography>
                    <Box
                        sx={{
                            flexShrink: 0,
                            width: 10,
                            height: 10,
                            mt: 0.5,
                            borderRadius: '50%',
                            backgroundColor: statusColor,
                            boxShadow: `0 0 6px ${statusColor}`,
                            animation: isPulsing ? 'hall-status-pulse 2s ease-in-out infinite' : 'none',
                            '@keyframes hall-status-pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.35 },
                            },
                            '@media (prefers-reduced-motion: reduce)': {
                                animation: 'none',
                            },
                        }}
                    />
                </Box>

                {showMarkerLayer && (
                    <Box sx={{ position: 'relative', flex: 1, minHeight: 0, width: '100%', mt: 1 }}>
                        <Typography
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                fontSize: '10px',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.35)',
                            }}
                        >
                            {stats.deviceCount} apparaten
                        </Typography>
                        {deviceMarkers.map((marker) => (
                            <Box
                                key={marker.id}
                                sx={{
                                    position: 'absolute',
                                    left: `${marker.relX * 100}%`,
                                    top: `${marker.relY * 100}%`,
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: markerColor(marker.urgency),
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    flexShrink: 0,
                    mt: showMarkerLayer ? 0 : 'auto',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                {actionBlocks.map((block, index) => (
                    <Box
                        key={block.label}
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.25,
                            py: 0.75,
                            px: 0.5,
                            borderRight: index < actionBlocks.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                        }}
                    >
                        <Typography
                            noWrap
                            sx={{
                                fontFamily: '"Archivo", sans-serif',
                                fontWeight: 600,
                                fontSize: '1.4rem',
                                lineHeight: 1.1,
                                color: block.color,
                            }}
                        >
                            {block.value}
                        </Typography>
                        <Typography
                            noWrap
                            sx={{
                                fontSize: '10px',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: theme.palette.blueprint.mutedText,
                            }}
                        >
                            {block.label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}
