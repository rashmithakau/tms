import React from 'react';

export interface IAdminToolbarProps {
  title: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }>;
}
