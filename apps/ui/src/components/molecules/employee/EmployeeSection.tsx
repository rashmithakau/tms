import { Box, Alert } from '@mui/material';
import TableWindowLayout from '../../templates/layout/TableWindowLayout';
import EmpTable from '../../organisms/table/EmpTable';
import EmpTableToolbar from '../common/other/EmpTableToolbar';
import BaseBtn from '../../atoms/common/button/BaseBtn';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PageLoading from '../common/loading/PageLoading';
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
  roleFilter,
  onRoleFilterChange,
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
            roleFilter={roleFilter}
            onRoleFilterChange={onRoleFilterChange}
            availableRoles={undefined}
          />
        </Box>,
        <Box sx={{ mt: 2 }}>
          <BaseBtn
            onClick={onAddEmployee}
            variant="contained"
            startIcon={<AddOutlinedIcon />}
          >
            Employee
          </BaseBtn>
        </Box>,
      ]}
      table={<EmpTable rows={rows} onEditRow={onEditEmployee} onRefresh={onRefresh} />}
    />
  );
};

export default EmployeeSection;
