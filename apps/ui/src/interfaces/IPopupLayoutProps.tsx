export interface IPopupLayoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  showCloseButton?: boolean;
  disableBackdropClick?: boolean;
  minHeight?: string | number;
  contentPadding?: number | string;
  titleProps?: Record<string, any>;
  contentProps?: { sx?: object } & Record<string, any>;
  actionsProps?: Record<string, any>;
}
