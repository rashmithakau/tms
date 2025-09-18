import { TimesheetStatus } from '@tms/shared';
import { DaySelection } from './ITimesheetCellEditing';

export interface TimesheetApprovalReturn {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  selectedDays: DaySelection[];
  setSelectedDays: (days: DaySelection[]) => void;
  isSelectionMode: boolean;
  setIsSelectionMode: (mode: boolean) => void;
  rejectionDialog: {
    open: boolean;
    selectedDays: DaySelection[];
  };
  setRejectionDialog: (dialog: { open: boolean; selectedDays: DaySelection[] }) => void;
  applyStatusToSelected: (status: TimesheetStatus, pendingIdsInFiltered: string[]) => Promise<void>;
  applyDailyStatusToSelected: (status: TimesheetStatus.Approved | TimesheetStatus.Rejected, rejectionReason?: string) => Promise<void>;
  handleRejectWithReason: (reason: string) => void;
  handleRejectClick: () => void;
  handleDaySelectionChange: (selections: DaySelection[]) => void;
  toggleSelectionMode: () => void;
}