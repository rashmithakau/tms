import { Box, Alert } from '@mui/material';
import TableWindowLayout from '../../templates/layout/TableWindowLayout';
import EmpTable from '../../organisms/table/EmpTable';
import EmpTableToolbar from '../other/EmpTableToolbar';
import BaseBtn from '../../atoms/button/BaseBtn';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PageLoading from '../loading/PageLoading';
import { EmpRow } from '../../templates/layout/TableWindowLayout';

interface EmployeeSectionProps {
  error?: string;
  isLoading: boolean;
  rows: EmpRow[];
  projectOptions: Array<{ id: string; name: string }>;
  selectedProjectIds: string[];
  onSelectedProjectIdsChange: (ids: string[]) => void;
  statusFilter: 'all' | 'Active' | 'Inactive';
  onStatusFilterChange: (filter: 'all' | 'Active' | 'Inactive') => void;
  onAddEmployee: () => void;
}

const EmployeeSection: React.FC<EmployeeSectionProps> = ({
  error,
  isLoading,
  rows,
  projectOptions,
  selectedProjectIds,
  onSelectedProjectIdsChange,
  statusFilter,
  onStatusFilterChange,
  onAddEmployee,
}) => {
  if (error) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (isLoading) return <PageLoading variant="inline" message="Loading accounts..." />;

  return (
    <Box sx={{ padding: 2, height: '93%' }}>
      <TableWindowLayout
        title="Employee & Admin Accounts"
        filter={
          <EmpTableToolbar
            projectsOptions={projectOptions}
            selectedProjectIds={selectedProjectIds}
            onSelectedProjectIdsChange={onSelectedProjectIdsChange}
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
          />
        }
        buttons={[
          <Box sx={{ mt: 2, ml: 2 }}>
            <BaseBtn
              onClick={onAddEmployee}
              variant="contained"
              startIcon={<AddOutlinedIcon />}
            >
              Add Account
            </BaseBtn>
          </Box>,
        ]}
        table={<EmpTable rows={rows} />}
      />
    </Box>
  );
};

export default EmployeeSection;
