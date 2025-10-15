import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface ReportSectionProps extends BoxProps {
  title?: string;
  children: React.ReactNode;
}

const ReportSection: React.FC<ReportSectionProps> = ({ 
  title, 
  children, 
  sx,
  ...props 
}) => {
  return (
    <Box
      sx={{
        mb: 3,
        ...sx
      }}
      {...props}
    >
      {title && (
        <Box sx={{ mb: 2 }}>
          {title}
        </Box>
      )}
      {children}
    </Box>
  );
};

export default ReportSection;
