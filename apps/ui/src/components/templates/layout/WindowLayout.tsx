import React from 'react';
import { Box } from '@mui/material';

interface WindowLayoutProps {
  titleBar?: React.ReactNode;
  children: React.ReactNode;
}

const WindowLayout: React.FC<WindowLayoutProps> = ({ titleBar, children }) => {
  return (
    <Box sx={{ padding: 1, height: '90vh' }}>
      <Box
        sx={{
          height: 'calc(90vh - 16px)',
          backgroundColor: 'white',
          padding: 2,
          margin: 1,
          borderRadius: 3,
          boxShadow: 1,
          overflow: 'auto'
        }}
      >
        {titleBar}
        {children}
      </Box>
    </Box>
  );
};

export default WindowLayout;


