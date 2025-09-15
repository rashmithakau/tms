import React from 'react'
import Box from '@mui/material/Box'
import { SvgIconComponent } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

interface AppIconProps {
  icon: SvgIconComponent
  size?: number
  color?: string
  marginBottom?: number
}

const AppIcon: React.FC<AppIconProps> = ({ icon: Icon, size = 40, color, marginBottom = 2 }) => {
  const theme = useTheme()
  const resolvedColor = color ?? theme.palette.primary.main

  return (
    <Box sx={{ mb: marginBottom }}>
      <Icon sx={{ fontSize: size, color: resolvedColor }} />
    </Box>
  )
}

export default AppIcon


