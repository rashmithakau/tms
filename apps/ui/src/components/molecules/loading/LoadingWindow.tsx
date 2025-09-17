import { Box, CircularProgress } from "@mui/material"

const LoadingWindow = () => {
  return (
    <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    }}
  >
    <CircularProgress />
  </Box>
  )
}

export default LoadingWindow