
import { ProjectRow } from '../table/ITableRowTypes';


export interface IProjectsSectionProps {
  error?: string;
  isLoading: boolean;
  rows: ProjectRow[];
  billable: 'all' | 'Yes' | 'No';
  onBillableChange: (billable: 'all' | 'Yes' | 'No') => void;
  onAddProject: () => void;
  onRefresh: () => Promise<void>;
}