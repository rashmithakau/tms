import React, { useState } from 'react';
import {
  Box,
  Popover,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import BaseBtn from '../../atoms/common/button/BaseBtn';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useTheme } from '@mui/material';
import { IProjectTableToolbarProps } from '../../../interfaces/component/project';

const BILLABLE_OPTIONS: Array<'all' | 'Yes' | 'No'> = ['all', 'Yes', 'No'];

export default function ProjectTableToolbar({
  billable,
  onBillableChange,
}: IProjectTableToolbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const activeCount = billable !== 'all' ? 1 : 0;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const theme = useTheme();
  return (
    <Box>
      <BaseBtn
        startIcon={<FilterAltOutlinedIcon />}
        onClick={handleOpen}
        variant="text"
        aria-label="Open filter menu"
        aria-controls={open ? 'filter-popover' : undefined}
      >
        Filter
      </BaseBtn>

      <Popover
        id="filter-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, width: 250 , bgcolor: theme.palette.background.paper } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Billable Type
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={billable}
          onChange={(_, value) => value && onBillableChange(value)}
          aria-label="Billable filter"
          sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}
        >
          {BILLABLE_OPTIONS.map((option) => (
            <ToggleButton key={option} value={option} aria-label={option}>
              {option === 'all'
                ? 'All'
                : option === 'Yes'
                ? 'Billable'
                : 'Non-billable'}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Divider sx={{ my: 1 }} />
        <Box>
          {activeCount > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
              {billable !== 'all' && (
                <Chip
                  size="small"
                  label={`Billable: ${billable}`}
                  onDelete={() => onBillableChange('all')}
                />
              )}
            </Stack>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'right',
              padding: 2,
              gap: 2,
            }}
          >
            <BaseBtn
              size="small"
              variant="outlined"
              onClick={() => {
                onBillableChange('all');
              }}
            >
              Clear
            </BaseBtn>
            <BaseBtn size="small" variant="contained" onClick={handleClose}>
              Done
            </BaseBtn>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
