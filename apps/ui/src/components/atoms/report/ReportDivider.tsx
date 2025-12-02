import React from 'react';
import { Divider, DividerProps } from '@mui/material';

interface ReportDividerProps extends DividerProps {
  spacing?: 'small' | 'medium' | 'large';
}

const ReportDivider: React.FC<ReportDividerProps> = ({ 
  spacing = 'medium',
  sx,
  ...props 
}) => {
  const spacingMap = {
    small: 1,
    medium: 2,
    large: 3
  };

  return (
    <Divider
      sx={{
        my: spacingMap[spacing],
        ...sx
      }}
      {...props}
    />
  );
};

export default ReportDivider;
