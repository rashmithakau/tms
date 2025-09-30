import { Box, Alert } from '@mui/material';
import TableWindowLayout from '../../templates/layout/TableWindowLayout';
import EmpTable from '../../organisms/table/EmpTable';
import EmpTableToolbar from '../other/EmpTableToolbar';
import BaseBtn from '../../atoms/button/BaseBtn';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PageLoading from '../loading/PageLoading';
import { IEmployeeManagementProps } from '../../../interfaces/list/IEmployeeManagementProps';

const EmployeeSection: React.FC<IEmployeeManagementProps> = ({
  error,
  isLoading,
  rows,
  projectOptions,
  selectedProjectIds,
  onSelectedProjectIdsChange,
  statusFilter,
  onStatusFilterChange,
  onAddEmployee,
  onEditEmployee,
  onRefresh,
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
    <TableWindowLayout
      title="Employee & Admin Accounts"
      filter={null}
      buttons={[
        <Box sx={{ mt: 2 }}>
          <EmpTableToolbar
            projectsOptions={projectOptions}
            selectedProjectIds={selectedProjectIds}
            onSelectedProjectIdsChange={onSelectedProjectIdsChange}
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
          />
        </Box>,
        <Box sx={{ mt: 2 }}>
          <BaseBtn
            onClick={onAddEmployee}
            variant="contained"
            startIcon={<AddOutlinedIcon />}
          >
            Add Account
          </BaseBtn>
        </Box>,
      ]}
      table={<EmpTable rows={rows} onEditRow={onEditEmployee} onRefresh={onRefresh} />}
    />
  );
};

export default EmployeeSection;
