import { ChipProps } from "@mui/material";

export interface RemoveButtonProps extends Omit<ChipProps, 'onDelete'> {
  onRemove: () => void;
  label?: string;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium';
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: boolean;
  showIcon?: boolean;
  labelColor?: string;
}