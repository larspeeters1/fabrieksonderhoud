import { useState, type ChangeEvent } from 'react'
import { Close, FilterAlt, Search, WarningAmber } from '@mui/icons-material'
import {
  Badge,
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import { DEFAULT_FILTERS, type HallFilters, type TimeWindow } from '../../model/filters'
import type { ActionStatus, ActionType, DeviceCategory } from '../../model/types'

const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  machine: 'Machine',
  band: 'Band',
  lamp: 'Lamp',
}

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  controle: 'Controle',
  vervanging: 'Vervanging',
  herstelling: 'Herstelling',
}

const STATUS_LABELS: Record<ActionStatus, string> = {
  open: 'Open',
  uitgevoerd: 'Uitgevoerd',
}

const TIME_WINDOW_LABELS: Record<TimeWindow, string> = {
  0: 'Vandaag',
  3: '3 dagen',
  7: '7 dagen',
  30: '30 dagen',
}

type SetFilter = <K extends keyof HallFilters>(key: K, value: HallFilters[K]) => void

interface FilterBarProps {
  filters: HallFilters
  setFilter: SetFilter
  resetFilters: () => void
  isDefault: boolean
  defaultFilters?: HallFilters
}

function countActiveFilters(filters: HallFilters, defaultFilters: HallFilters): number {
  let count = 0
  if (filters.category !== undefined) count += 1
  if (filters.actionType !== undefined) count += 1
  if (filters.status !== undefined) count += 1
  if (filters.timeWindow !== defaultFilters.timeWindow) count += 1
  if (filters.highUrgencyOnly) count += 1
  if (filters.search.trim() !== '') count += 1
  return count
}

export default function FilterBar({
  filters,
  setFilter,
  resetFilters,
  isDefault,
  defaultFilters = DEFAULT_FILTERS,
}: FilterBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const activeCount = countActiveFilters(filters, defaultFilters)

  return (
    <Box sx={{ mb: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          p: 1,
          borderRadius: '10px',
          borderColor: 'divider',
        }}
      >
        <FilterControls filters={filters} setFilter={setFilter} />
        {!isDefault && (
          <Button size="small" onClick={resetFilters} sx={{ ml: 'auto' }}>
            Reset filters
          </Button>
        )}
      </Paper>

      <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
        <Badge badgeContent={activeCount} color="primary" invisible={activeCount === 0}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FilterAlt fontSize="small" />}
            onClick={() => setDrawerOpen(true)}
          >
            Filters{activeCount > 0 ? ` (${activeCount} actief)` : ''}
          </Button>
        </Badge>
      </Box>

      <Drawer anchor="bottom" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
              Filters
            </Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)} aria-label="Sluiten">
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <FilterControls filters={filters} setFilter={setFilter} fullWidth />
          </Box>
          {!isDefault && (
            <Button size="small" onClick={resetFilters}>
              Reset filters
            </Button>
          )}
        </Box>
      </Drawer>

      <ActiveFilterChips filters={filters} setFilter={setFilter} defaultFilters={defaultFilters} />
    </Box>
  )
}

function FilterControls({
  filters,
  setFilter,
  fullWidth = false,
}: {
  filters: HallFilters
  setFilter: SetFilter
  fullWidth?: boolean
}) {
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setFilter('category', (event.target.value || undefined) as DeviceCategory | undefined)
  }
  const handleActionTypeChange = (event: SelectChangeEvent) => {
    setFilter('actionType', (event.target.value || undefined) as ActionType | undefined)
  }
  const handleStatusChange = (event: SelectChangeEvent) => {
    setFilter('status', (event.target.value || undefined) as ActionStatus | undefined)
  }
  const handleTimeWindowChange = (event: SelectChangeEvent) => {
    setFilter('timeWindow', Number(event.target.value) as TimeWindow)
  }
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilter('search', event.target.value)
  }

  return (
    <>
      <FormControl size="small" fullWidth={fullWidth} sx={{ minWidth: fullWidth ? undefined : 130 }}>
        <InputLabel id="filter-category-label">Categorie</InputLabel>
        <Select
          labelId="filter-category-label"
          label="Categorie"
          value={filters.category ?? ''}
          onChange={handleCategoryChange}
        >
          <MenuItem value="">Alle</MenuItem>
          {(Object.keys(CATEGORY_LABELS) as DeviceCategory[]).map((category) => (
            <MenuItem key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth={fullWidth} sx={{ minWidth: fullWidth ? undefined : 140 }}>
        <InputLabel id="filter-action-type-label">Type actie</InputLabel>
        <Select
          labelId="filter-action-type-label"
          label="Type actie"
          value={filters.actionType ?? ''}
          onChange={handleActionTypeChange}
        >
          <MenuItem value="">Alle</MenuItem>
          {(Object.keys(ACTION_TYPE_LABELS) as ActionType[]).map((actionType) => (
            <MenuItem key={actionType} value={actionType}>
              {ACTION_TYPE_LABELS[actionType]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth={fullWidth} sx={{ minWidth: fullWidth ? undefined : 120 }}>
        <InputLabel id="filter-status-label">Status</InputLabel>
        <Select labelId="filter-status-label" label="Status" value={filters.status ?? ''} onChange={handleStatusChange}>
          <MenuItem value="">Alle</MenuItem>
          {(Object.keys(STATUS_LABELS) as ActionStatus[]).map((status) => (
            <MenuItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth={fullWidth} sx={{ minWidth: fullWidth ? undefined : 150 }}>
        <InputLabel id="filter-time-window-label">Tijdsvenster</InputLabel>
        <Select
          labelId="filter-time-window-label"
          label="Tijdsvenster"
          value={String(filters.timeWindow)}
          onChange={handleTimeWindowChange}
        >
          {([0, 3, 7, 30] as TimeWindow[]).map((timeWindow) => (
            <MenuItem key={timeWindow} value={timeWindow}>
              {TIME_WINDOW_LABELS[timeWindow]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Chip
        clickable
        icon={<WarningAmber fontSize="small" />}
        label="Urgent"
        color={filters.highUrgencyOnly ? 'warning' : 'default'}
        variant={filters.highUrgencyOnly ? 'filled' : 'outlined'}
        onClick={() => setFilter('highUrgencyOnly', !filters.highUrgencyOnly)}
      />

      <TextField
        size="small"
        placeholder="Zoeken..."
        value={filters.search}
        onChange={handleSearchChange}
        fullWidth={fullWidth}
        sx={{ minWidth: fullWidth ? undefined : 180, flexGrow: fullWidth ? undefined : 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: filters.search && (
              <InputAdornment position="end">
                <IconButton size="small" aria-label="Zoekterm wissen" onClick={() => setFilter('search', '')}>
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </>
  )
}

function ActiveFilterChips({
  filters,
  setFilter,
  defaultFilters,
}: {
  filters: HallFilters
  setFilter: SetFilter
  defaultFilters: HallFilters
}) {
  const chips: { key: string; label: string; onDelete: () => void }[] = []

  if (filters.category) {
    chips.push({
      key: 'category',
      label: `Categorie: ${CATEGORY_LABELS[filters.category]}`,
      onDelete: () => setFilter('category', undefined),
    })
  }
  if (filters.actionType) {
    chips.push({
      key: 'actionType',
      label: `Type actie: ${ACTION_TYPE_LABELS[filters.actionType]}`,
      onDelete: () => setFilter('actionType', undefined),
    })
  }
  if (filters.status) {
    chips.push({
      key: 'status',
      label: `Status: ${STATUS_LABELS[filters.status]}`,
      onDelete: () => setFilter('status', undefined),
    })
  }
  if (filters.timeWindow !== defaultFilters.timeWindow) {
    chips.push({
      key: 'timeWindow',
      label: `Tijdsvenster: ${TIME_WINDOW_LABELS[filters.timeWindow]}`,
      onDelete: () => setFilter('timeWindow', defaultFilters.timeWindow),
    })
  }
  if (filters.highUrgencyOnly) {
    chips.push({
      key: 'highUrgencyOnly',
      label: 'Urgent',
      onDelete: () => setFilter('highUrgencyOnly', false),
    })
  }
  if (filters.search.trim() !== '') {
    chips.push({
      key: 'search',
      label: `Zoekterm: "${filters.search.trim()}"`,
      onDelete: () => setFilter('search', ''),
    })
  }

  if (chips.length === 0) return null

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
      {chips.map((chip) => (
        <Chip key={chip.key} size="small" label={chip.label} onDelete={chip.onDelete} />
      ))}
    </Box>
  )
}
