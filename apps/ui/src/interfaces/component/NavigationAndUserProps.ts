import { ChangeEvent } from 'react';

// Navigation interfaces
export interface NavDrawerProps {
  selectedIndex: number;
  open: boolean;
  onToggle: () => void;
  onSelect: (index: number) => void;
}

export interface WeekNavigatorProps {
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

// Employee/User interfaces
export interface EmployeeTimesheetCalendarProps {
  employeeId: string;
}

export interface NotificationDropdownProps {
  notifications: any[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export interface UserPopoverBoxProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}
