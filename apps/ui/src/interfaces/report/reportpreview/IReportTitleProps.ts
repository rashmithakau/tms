import { TypographyProps } from '@mui/material';

export interface ReportTitleProps extends TypographyProps {
  variant?: 'h4' | 'h5' | 'h6';
  color?: 'primary' | 'secondary' | 'textPrimary' | 'textSecondary';
}
