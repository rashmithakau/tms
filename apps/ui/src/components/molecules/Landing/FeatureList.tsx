import React from 'react'
import Box from '@mui/material/Box'
import FeatureListItem from '../../atoms/landing/FeatureListItem'

interface FeatureListProps {
  features: string[]
}

const FeatureList: React.FC<FeatureListProps> = ({ features }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 1.5,
      }}
   >
      {features.map((text, idx) => (
        <FeatureListItem key={idx} text={text} />
      ))}
    </Box>
  )
}

export default FeatureList


