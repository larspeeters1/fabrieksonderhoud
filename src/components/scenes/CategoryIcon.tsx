import { LightbulbOutlined, PrecisionManufacturing, SwapHoriz } from '@mui/icons-material'
import type { SxProps, Theme } from '@mui/material'
import type { DeviceCategory } from '../../model/types'

interface CategoryIconProps {
  category: DeviceCategory
  sx?: SxProps<Theme>
  fontSize?: 'inherit' | 'small' | 'medium' | 'large'
}

export default function CategoryIcon({ category, sx, fontSize }: CategoryIconProps) {
  switch (category) {
    case 'machine':
      return <PrecisionManufacturing sx={sx} fontSize={fontSize} />
    case 'band':
      return <SwapHoriz sx={sx} fontSize={fontSize} />
    case 'lamp':
      return <LightbulbOutlined sx={sx} fontSize={fontSize} />
  }
}
