import React from 'react';
import { Box, Typography } from '@mui/material';
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
