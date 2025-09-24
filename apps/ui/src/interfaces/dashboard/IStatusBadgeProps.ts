import { ChipProps } from '@mui/material';

export interface IStatusBadgeProps extends Omit<ChipProps, 'color'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'approved' | 'rejected';
  text?: string;
}
