import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface EmpRow {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  role?: string;
  supervisedProjects?: string[];
  memberProjects?: string[];
  status: 'Active' | 'Inactive' | string;
  contactNumber: string;
  createdAt?: string;
}

export interface ProjectRow {
  id: string;
  projectName: string;
  billable: 'Yes' | 'No';
  createdAt?: string;
  employees?: { id: string; name: string; designation?: string;  }[];
  supervisor?: { id: string; name: string; designation?: string; email?: string } | null;
}

interface TableWindowLayoutProps {
  title: string;
  buttons: React.ReactNode[];
  table: React.ReactNode;
  search?: React.ReactNode;
  filter?: React.ReactNode;
}

const TableWindowLayout: React.FC<TableWindowLayoutProps> = ({
  title,
  buttons,
  table,
  search,
  filter,
}) => {
  const theme = useTheme();

  return (
    <Box
      height="auto"
      sx={{
        height: '100%',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" color={theme.palette.primary.main}>
          {title}
        </Typography>
        <Box>{search}</Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ mt: 2 }}>{filter}</Box>
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
