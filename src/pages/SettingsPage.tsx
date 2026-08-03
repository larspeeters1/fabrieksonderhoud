import {
  ArrowBack,
  DarkMode,
  LightMode,
  Map as MapIcon,
  SettingsBrightness,
  ViewList,
} from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import type { MouseEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import type { HallView, ThemeMode } from '../model/settings'
import type { TimeWindow } from '../model/filters'

const TIME_WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: 0, label: 'Vandaag' },
  { value: 3, label: '3 dagen' },
  { value: 7, label: '7 dagen' },
  { value: 30, label: '30 dagen' },
]

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings()
  const navigate = useNavigate()

  const handleThemeModeChange = (_: MouseEvent<HTMLElement>, value: ThemeMode | null) => {
    if (value) updateSetting('themeMode', value)
  }

  const handleTimeWindowChange = (_: MouseEvent<HTMLElement>, value: TimeWindow | null) => {
    if (value !== null) updateSetting('defaultTimeWindow', value)
  }

  const handleHallViewChange = (_: MouseEvent<HTMLElement>, value: HallView | null) => {
    if (value) updateSetting('defaultHallView', value)
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="Terug">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Instellingen
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        <SettingSection title="Weergavemodus" description="Kies licht, donker of volg je systeeminstelling">
          <ToggleButtonGroup
            value={settings.themeMode}
            exclusive
            onChange={handleThemeModeChange}
            fullWidth
            size="small"
          >
            <ToggleButton value="light" aria-label="Licht">
              <LightMode fontSize="small" sx={{ mr: 0.75 }} />
              Licht
            </ToggleButton>
            <ToggleButton value="dark" aria-label="Donker">
              <DarkMode fontSize="small" sx={{ mr: 0.75 }} />
              Donker
            </ToggleButton>
            <ToggleButton value="system" aria-label="Systeem">
              <SettingsBrightness fontSize="small" sx={{ mr: 0.75 }} />
              Systeem
            </ToggleButton>
          </ToggleButtonGroup>
        </SettingSection>

        <SettingSection
          title="Standaard tijdsvenster"
          description="Welke acties standaard zichtbaar zijn wanneer je een fabriekshal opent"
        >
          <ToggleButtonGroup
            value={settings.defaultTimeWindow}
            exclusive
            onChange={handleTimeWindowChange}
            fullWidth
            size="small"
          >
            {TIME_WINDOW_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </SettingSection>

        <SettingSection title="Urgentie-indicaties" description="Rode en oranje markeringen bij deadlines tonen">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>Tonen</Typography>
            <Switch
              checked={settings.showUrgencyIndicators}
              onChange={(event) => updateSetting('showUrgencyIndicators', event.target.checked)}
              slotProps={{ input: { 'aria-label': 'Urgentie-indicaties tonen' } }}
            />
          </Stack>
        </SettingSection>

        <SettingSection title="Standaardweergave hal" description="Hoe een fabriekshal standaard opent">
          <ToggleButtonGroup
            value={settings.defaultHallView}
            exclusive
            onChange={handleHallViewChange}
            fullWidth
            size="small"
          >
            <ToggleButton value="plattegrond" aria-label="Plattegrond">
              <MapIcon fontSize="small" sx={{ mr: 0.75 }} />
              Plattegrond
            </ToggleButton>
            <ToggleButton value="lijst" aria-label="Lijst">
              <ViewList fontSize="small" sx={{ mr: 0.75 }} />
              Lijst
            </ToggleButton>
          </ToggleButtonGroup>
        </SettingSection>
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 3 }}>
        <Button onClick={resetSettings}>Herstel standaardinstellingen</Button>
        <Typography variant="caption" color="text.secondary">
          Instellingen worden lokaal op dit toestel bewaard
        </Typography>
      </Box>
    </Box>
  )
}

function SettingSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '10px', borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      {children}
    </Paper>
  )
}
