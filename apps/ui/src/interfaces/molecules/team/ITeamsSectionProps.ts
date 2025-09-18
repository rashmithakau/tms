import { TeamRow } from '../../component/table/ITableRowTypes';

export interface TeamsSectionProps {
  error?: string;
  isLoading: boolean;
  onAddTeam: () => void;
  rows?: TeamRow[];
}
