import React from 'react';
import { Box } from '@mui/material';

interface WindowLayoutProps {
  titleBar?: React.ReactNode;
  children: React.ReactNode;
}

const WindowLayout: React.FC<WindowLayoutProps> = ({ titleBar, children }) => {
  return (
      <Box
        sx={{
          height: '100%',
          backgroundColor: 'white',
          borderRadius: 3,
          boxShadow: 1,
          overflow: 'auto',
        }}
      >
        <Box sx={{ padding: 2}}>
        {titleBar}
        {children}
        </Box>

      </Box>
  );
};

export default WindowLayout;


