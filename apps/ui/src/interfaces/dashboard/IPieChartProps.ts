export interface IPieChartData {
  label: string;
  value: number;
  color: string;
}

export interface IPieChartProps {
  data: IPieChartData[];
  title?: string;
  width?: number;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export interface ITimesheetStatusChartProps {
  submittedCount: number;
  pendingCount: number;
  lateCount: number;
  approvedCount: number;
  rejectedCount: number;
  month?: string;
  year?: number;
  title?: string;
  loading?: boolean;
  error?: string | null;
}
