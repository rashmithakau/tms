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

export interface ProjectRow {
  id: string;
  projectName: string;
  billable: 'Yes' | 'No';
  createdAt?: string;
  employees?: { id: string; name: string; designation?: string }[];
  supervisor?: { id: string; name: string; designation?: string } | null;
}

interface TableWindowLayoutProps {
  title: string;
  buttons: React.ReactNode[];
  table: React.ReactNode;
  search?: React.ReactNode;

}

const TableWindowLayout: React.FC<TableWindowLayoutProps> = ({ title, buttons, table, search }) => {
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
        <Box>
          {search}
        </Box>
      
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