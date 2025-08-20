import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface EmpRow {
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  status: 'Active' | 'Inactive' | string;
  contactNumber: string;
  createdAt?: string;
}

interface TimeSheetPageProps {
  rows: EmpRow[];
  title: string;
  buttons: React.ReactNode[];
  table: React.ReactNode; 
}

const TableWindowLayout: React.FC<TimeSheetPageProps> = ({title, buttons,table }) => {
  const theme = useTheme(); 

  return (
    <Box
      height='auto'
      sx={{
        height: '100%',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
      }
      
    }
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" color={theme.palette.primary.main}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
          {buttons.map((button, index) => (
            <React.Fragment key={index}>{button}</React.Fragment>
          ))}
        </Box>
      </Box>
      {table}
    </Box>
  );
};

export default TableWindowLayout;