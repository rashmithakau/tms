import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { IStatCardProps } from '../../../interfaces/dashboard';

const StatCard: React.FC<IStatCardProps> = ({
  title,
  value,
  icon,
  trend,
  backgroundColor = 'background.paper',
  textColor = 'text.primary'
}) => {
  return (
    <Card
      sx={{
        minHeight: 150,
        backgroundColor,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={textColor} fontWeight="bold">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <Chip
                  icon={trend.isPositive ? <TrendingUp /> : <TrendingDown />}
                  label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
                  size="small"
                  color={trend.isPositive ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
          <Box color="primary.main">
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
