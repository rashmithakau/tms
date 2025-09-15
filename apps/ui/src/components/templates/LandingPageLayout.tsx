import React from 'react'
import Box from '@mui/material/Box'
import Header from '../../components/organisms/Landing/Header'
import Footer from '../../components/organisms/Landing/Footer'

const LandingPageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box component="main" sx={{ flex: 1, pt: { xs: 8, sm: 10 } }}>
        {children}
      </Box>
      <Footer />
    </Box>
  )
}

export default LandingPageLayout
