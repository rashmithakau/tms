import React from 'react';
import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close } from '@mui/icons-material';
import { RemoveButtonProps } from '../../../interfaces/IRemoveButtonProps';

const RemoveButton: React.FC<RemoveButtonProps> = ({
  onRemove,
  label = 'Remove',
  variant = 'outlined',
  size = 'small',
  color ,
  disabled = false,
  showIcon = true,
  labelColor,
  sx,
  ...props
}) => {
  const theme = useTheme();

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent parent click events
    onRemove();
  };

  return (
    <Chip
      {...props}
      label={label}
      //Make entire chip clickable instead of just delete icon
      onClick={handleRemove}
      //  Remove onDelete to prevent double handling
      onDelete={undefined}
      variant={variant}
      size={size}
      color={color}
      disabled={disabled}
      // Optional: Keep icon for visual indication but it's not clickable separately
      deleteIcon={showIcon ? <Close /> : undefined}
      sx={{
        height: size === 'small' ? '24px' : '32px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        '& .MuiChip-label': {
          color: labelColor || theme.palette.error.main,
        },
        '& .MuiChip-deleteIcon': {
          fontSize: size === 'small' ? '16px' : '18px',
          color: theme.palette.error.main,
          // Remove hover effect since icon is not separately clickable
          pointerEvents: 'none', // Make icon non-interactive
        },
        '&:hover': !disabled
          ? {
              backgroundColor: theme.palette.error.main + '20',
              borderColor: theme.palette.error.main,
              
            }
          : {},
        // Add active state for better UX
        '&:active': !disabled
          ? {
              transform: 'scale(0.95)',
              transition: 'all 0.1s ease-in-out',
            }
          : {},
        ...sx,
      }}
    />
  );
};

export default RemoveButton;