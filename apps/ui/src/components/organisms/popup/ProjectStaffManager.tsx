import { useEffect, useMemo, useState } from 'react';
import { Box, Divider } from '@mui/material';
import PopupLayout from '../../templates/popup/PopUpLayout';
import BaseBtn from '../../atoms/button/BaseBtn';
import { useUsersByRoles } from '../../../hooks/api/useUsers';
import { UserRole } from '@tms/shared';
import { updateProjectStaff } from '../../../api/project';
import { IEmployeeProps } from '../../../interfaces/entity/IEmployeeProps';
import { useToast } from '../../../contexts/ToastContext';
import StaffSelector from '../../molecules/employee/StaffSelector';
import SupervisorSelector from '../../molecules/supervisor/SupervisorSelector';
import SelectedEmployeeChips from '../../molecules/employee/SelectedEmployeeChips';
import { ProjectStaffManagerProps } from '../../../interfaces/organisms/popup';

export default function ProjectStaffManager({
  open,
  onClose,
  projectId,
  initialEmployees,
  initialSupervisor,
  onSaved,
}: ProjectStaffManagerProps) {
  
  const { users } = useUsersByRoles([UserRole.Emp, UserRole.Supervisor]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployeeProps[]>(
    []
  );
  const [supervisor, setSupervisor] = useState<string | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const employeeOptions: IEmployeeProps[] = useMemo(
    () =>
      users.map((u: any) => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        designation: u.designation,
      })),
    [users]
  );

  useEffect(() => {
    if (open) {
      setSelectedEmployees(
        initialEmployees.map(
          (e) =>
            employeeOptions.find((o) => o.id === e.id) || {
              id: e.id,
              name: e.name,
              email: '',
              designation: e.designation || '',
            }
        )
      );
      setSupervisor(initialSupervisor?.id || '');
      setSearchTerm('');
    }
  }, [open, initialEmployees, initialSupervisor, employeeOptions]);

  const filteredEmployees = useMemo(() => {
    const lc = searchTerm.toLowerCase();
    return employeeOptions.filter((e) =>
      [e.name, e.email, e.designation]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(lc))
    );
  }, [employeeOptions, searchTerm]);

  const handleEmployeeToggle = (employee: IEmployeeProps) => {
    setSelectedEmployees((prev) => {
      const exists = prev.some((e) => e.id === employee.id);
      if (exists) {
        const updated = prev.filter((e) => e.id !== employee.id);
        if (supervisor === employee.id) setSupervisor('');
        return updated;
      }
      return [...prev, employee];
    });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    if (supervisor === employeeId) setSupervisor('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProjectStaff(projectId, {
        employees: selectedEmployees.map((e) => e.id),
        supervisor: supervisor || null,
      });
      toast.success('Project staff updated');
      onSaved && onSaved();
      onClose();
    } catch (e) {
      toast.error('Failed to update project staff');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PopupLayout
      open={open}
      onClose={onClose}
      title="Manage Project Members"
      subtitle="Add or remove project members and set a supervisor"
    >
      <Box>
        <SelectedEmployeeChips
          employees={selectedEmployees}
          onRemove={handleRemoveEmployee}
          title="Selected Employees"
          sx={{ mb: 2 }}
        />
        <SupervisorSelector
          selectedEmployees={selectedEmployees}
          supervisor={supervisor}
          onSupervisorChange={setSupervisor}
          caption="Choose a supervisor from selected employees"
        />
        <StaffSelector
          selectedEmployees={selectedEmployees}
          availableEmployees={filteredEmployees}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEmployeeToggle={handleEmployeeToggle}
          onRemoveEmployee={handleRemoveEmployee}
          title="Add more employees"
        />
      </Box>
      <Box>
        <Divider sx={{ mt: 2 }} />
      </Box>
      <Box
        sx={{
          mt: 3,
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'flex-end',
        }}
      >
        <BaseBtn
          type="button"
          onClick={onClose}
          variant="outlined"
          disabled={isLoading}
        >
          Cancel
        </BaseBtn>
        <BaseBtn onClick={handleSave} variant="contained" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </BaseBtn>
      </Box>
    </PopupLayout>
  );
}
