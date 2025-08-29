import React from 'react';
import { Popover, InputBase } from '@mui/material';

export interface DescriptionPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  description: string;
  onClose: () => void;
  onChange: (value: string) => void;
  placeholder?: string;
}

const DescriptionPopover: React.FC<DescriptionPopoverProps> = ({
  open,
  anchorEl,
  description,
  onClose,
  onChange,
  placeholder = "Enter description",
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <InputBase
        value={description}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        multiline
        maxRows={4}
        sx={{
          p: 2,
          minWidth: 250,
          maxWidth: 400,
          fontSize: '14px',
          '& textarea': {
            resize: 'vertical',
          },
        }}
      />
    </Popover>
  );
};

export default DescriptionPopover;