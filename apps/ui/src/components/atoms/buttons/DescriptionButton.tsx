import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { EditNote as EditNoteIcon } from '@mui/icons-material';

export interface DescriptionButtonProps {
  description?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const DescriptionButton: React.FC<DescriptionButtonProps> = ({
  description,
  onClick,
  disabled = false,
  size = 'small',
}) => {
  const tooltipTitle = description || 'Add description';
  const hasDescription = Boolean(description?.trim());

  return (
    <Tooltip title={tooltipTitle}>
      <IconButton
        size={size}
        onClick={onClick}
        disabled={disabled}
        sx={{
          color: hasDescription ? 'primary.main' : 'action.disabled',
          '&:hover': {
            color: hasDescription ? 'primary.dark' : 'action.hover',
          },
        }}
      >
        <EditNoteIcon fontSize={size} />
      </IconButton>
    </Tooltip>
  );
};

export default DescriptionButton;