import { ReactNode } from 'react';


export interface SecondaryLayoutProps {
  children: ReactNode;
}

export interface MainLayoutProps {
  children: ReactNode;
}

export interface TableWindowLayoutProps {
  selectedCount: number;
  itemName: string;
  onAdd: () => void;
  onDelete?: () => void;
  addButtonText?: string;
  deleteButtonText?: string;
  showDeleteButton?: boolean;
  children: ReactNode;
}
