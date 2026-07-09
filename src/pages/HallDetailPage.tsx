import { Box, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useHalls } from '../hooks/useHalls'

export default function HallDetailPage() {
  const { hallId } = useParams<{ hallId: string }>()
  const { data: halls } = useHalls()
  const hall = halls?.find((h) => h.id === hallId)

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" component="h1">
        {hall ? hall.name : 'Hal'}
      </Typography>
    </Box>
  )
}
