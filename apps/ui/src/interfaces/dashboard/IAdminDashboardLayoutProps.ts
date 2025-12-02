import { ReactNode } from 'react';

export interface IAdminDashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
}
