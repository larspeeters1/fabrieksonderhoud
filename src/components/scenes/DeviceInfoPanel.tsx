import { Delete, Edit, MyLocation } from '@mui/icons-material'
import { Avatar, Box, Button, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import type { Device, DeviceCategory } from '../../model/types'
import CategoryIcon from './CategoryIcon'

const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  machine: 'Machine',
  band: 'Band',
  lamp: 'Lamp',
}

interface DeviceInfoPanelProps {
  device: Device
  hallName: string | undefined
  isAdmin: boolean
  onShowOnMap: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function DeviceInfoPanel({ device, hallName, isAdmin, onShowOnMap, onEdit, onDelete }: DeviceInfoPanelProps) {
  return (
      <Paper
          elevation={0}
          variant="outlined"
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
            p: { xs: 2, sm: 3 },
            borderRadius: '12px',
            borderColor: 'divider',
          }}
      >
        <Avatar
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              flexShrink: 0,
              bgcolor: 'rgba(21,101,192,0.1)',
              color: 'primary.main',
            }}
        >
          <CategoryIcon category={device.category} fontSize="medium" />
        </Avatar>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, flex: '1 1 180px' }}>
          <Typography variant="h6" sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 700, wordBreak: 'break-word' }}>
            {device.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {CATEGORY_LABELS[device.category]}
            {hallName ? ` · ${hallName}` : ''}
          </Typography>
          {device.serialNumber && (
              <Typography variant="body2" color="text.secondary">
                Serienummer: {device.serialNumber}
              </Typography>
          )}
          {device.description && <Typography variant="body2">{device.description}</Typography>}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Positie: x {device.x}, y {device.y}
          </Typography>
        </Box>

        <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', sm: 'column' },
              alignItems: { xs: 'center', sm: 'flex-end' },
              justifyContent: { xs: 'space-between', sm: 'flex-start' },
              flexWrap: 'wrap',
              gap: 1,
              flexShrink: 0,
              width: { xs: '100%', sm: 'auto' },
              ml: { xs: 0, sm: 'auto' },
            }}
        >
          <Button variant="outlined" size="small" startIcon={<MyLocation />} onClick={onShowOnMap}>
            Toon op plattegrond
          </Button>
          {isAdmin && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Apparaat bewerken">
                  <IconButton size="small" onClick={onEdit} aria-label="Apparaat bewerken">
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Apparaat verwijderen">
                  <IconButton size="small" color="error" onClick={onDelete} aria-label="Apparaat verwijderen">
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
          )}
        </Box>
      </Paper>
  )
}