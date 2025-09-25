import React from 'react';
import { Box, Typography } from '@mui/material';
import WindowLayout from './WindowLayout';
import { useTheme } from '@mui/material/styles';
import { ITableWindowLayoutProps } from '../../../interfaces/layout';

const TableWindowLayout: React.FC<ITableWindowLayoutProps> = ({
  title,
  buttons,
  table,
  search,
  filter,
}) => {
  const theme = useTheme();

  return (
    <WindowLayout
      titleBar={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary.main">{title}</Typography>
          <Box>{search}</Box>
        </Box>
      }
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ mt: 2 }}>{filter}</Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {buttons.map((button, index) => (
            <React.Fragment key={index}>{button}</React.Fragment>
          ))}
        </Box>
      </Box>

      {table}
    </WindowLayout>
  );
};

export default TableWindowLayout;
