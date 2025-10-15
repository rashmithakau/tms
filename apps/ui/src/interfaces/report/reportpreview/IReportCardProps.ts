import { PaperProps } from '@mui/material';

export interface ReportCardProps extends Omit<PaperProps, 'variant'> {
  variant?: 'elevation' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}
