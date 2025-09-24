import { IAdminStatsOverviewProps, ITableColumn } from './index';

export interface IAdminDashboardWindowProps {
  statsData: IAdminStatsOverviewProps;
  statsLoading?: boolean;
  statsError?: string | null;
  rejectionReasons?: string[];
  rejectionReasonsLoading?: boolean;
  rejectionReasonsError?: string | null;
  timesheetStats?: {
    submittedCount: number;
    pendingCount: number;
    lateCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
  usersData?: {
    rows: any[];
    columns: ITableColumn[];
  };
  projectsData?: {
    rows: any[];
    columns: ITableColumn[];
  };
  onAddUser?: () => void;
  onAddProject?: () => void;
  onEditUser?: (id: string | number) => void;
  onDeleteUser?: (id: string | number) => void;
  onEditProject?: (id: string | number) => void;
  onDeleteProject?: (id: string | number) => void;
  onViewReports?: () => void;
  onManageSettings?: () => void;
  onViewTimesheet?: (timesheetId: string) => void;
}
