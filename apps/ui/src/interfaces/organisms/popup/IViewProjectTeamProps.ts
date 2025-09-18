import { ProjectRow } from '../../component/table/ITableRowTypes';

export interface ViewProjectTeamProps {
  open: boolean;
  onClose: () => void;
  project: ProjectRow | null;
}