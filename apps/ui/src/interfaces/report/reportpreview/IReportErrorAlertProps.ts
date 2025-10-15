import { AlertProps } from '@mui/material';

export interface ReportErrorAlertProps extends AlertProps {
  error: string | null;
  onClose?: () => void;
}
