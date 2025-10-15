import { BoxProps } from '@mui/material';

export interface ReportSectionProps extends BoxProps {
  title?: string;
  children: React.ReactNode;
}
