import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EmpTable from '../organisms/EmpTable'; // Ensure this is the correct import path

export interface EmpRow {
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  status: 'Active' | 'Inactive' | string;
  contactNumber: string;
}

interface TimeSheetPageProps {
  rows: EmpRow[];
  title: string;
  buttons: React.ReactNode[];
}

const TableWindowLayout: React.FC<TimeSheetPageProps> = ({ rows, title, buttons }) => {
  const theme = useTheme(); 

  return (
    <Box
      height={'100%'}
      sx={{
        padding: theme.spacing(3),
        backgroundColor: theme.palette.background.default,
        margin: theme.spacing(2),
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
      <EmpTable rows={rows} />
    </Box>
  );
};

export default TableWindowLayout;