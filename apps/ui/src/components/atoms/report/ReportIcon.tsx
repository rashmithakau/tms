import React from 'react';
import { Assessment as ReportIcon } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';

interface ReportIconAtomProps extends SvgIconProps {
  variant?: 'default' | 'large';
}

const ReportIconAtom: React.FC<ReportIconAtomProps> = ({ 
  variant = 'default', 
  sx,
  ...props 
}) => {
  const iconSize = variant === 'large' ? 64 : 24;
  
  return (
    <ReportIcon
      sx={{
        fontSize: iconSize,
        color: 'text.secondary',
        ...sx
      }}
      {...props}
    />
  );
};

export default ReportIconAtom;
