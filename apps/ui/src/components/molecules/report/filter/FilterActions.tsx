import React from 'react';
import { Box, Button } from '@mui/material';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import QuickDateButtons from './QuickDateButtons';
import { FilterActionsProps } from '../../../../interfaces/report/filter';

const FilterActions: React.FC<FilterActionsProps> = ({ 
  onReset, 
  onDateRangeSelect, 
  disabled = false 
}) => {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Button
        startIcon={<RestartAltRoundedIcon />}
        variant="contained"
        size="small"
        onClick={onReset}
        disabled={disabled}
      >
        Reset
      </Button>
      <QuickDateButtons 
        onDateRangeSelect={onDateRangeSelect} 
        disabled={disabled} 
      />
    </Box>
  );
};

export default FilterActions;
