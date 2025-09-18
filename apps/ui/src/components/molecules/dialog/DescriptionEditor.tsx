import React from 'react';
import { Popover, InputBase } from '@mui/material';
import { IDescriptionEditorProps } from '../../../interfaces/component/dialog';

const DescriptionEditor: React.FC<IDescriptionEditorProps> = ({
  open,
  anchorEl,
  value,
  onChange,
  onClose,
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <InputBase
        value={value}
        placeholder="Enter description"
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        sx={{ p: 1, width: 250 }}
      />
    </Popover>
  );
};

export default DescriptionEditor;