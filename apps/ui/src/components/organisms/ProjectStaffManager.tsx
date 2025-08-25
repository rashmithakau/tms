import { useEffect, useMemo, useState } from 'react';
import PopupLayout from '../templates/PopUpLayout';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Divider,
} from '@mui/material';
import BaseBtn from '../atoms/buttons/BaseBtn';
import SelectedEmployeeChips from '../molecules/SelectedEmployeeChips';
import EmployeeList from '../molecules/EmployeeList';
import SearchField from '../molecules/SearchField';
import { useUsersByRoles } from '../../hooks/useUsers';
import { UserRole } from '@tms/shared';
import { updateProjectStaff } from '../../api/project';
import { IEmployeeProps } from '../../interfaces/IEmployeeProps';
import theme from '../../styles/theme';
import { useToast } from '../contexts/ToastContext';

export default function ProjectStaffManager({
  open,
  onClose,
  projectId,
  initialEmployees,
  initialSupervisor,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  initialEmployees: { id: string; name: string; designation?: string }[];
  initialSupervisor: { id: string; name: string; designation?: string } | null;
  onSaved?: () => void;
}) {
  // Fetch both employees and supervisors to allow adding any non-assigned staff
  const { users } = useUsersByRoles([UserRole.Emp, UserRole.Supervisor]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployeeProps[]>(
    []
  );
  const [supervisor, setSupervisor] = useState<string | ''>('');

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
  const toast = useToast();

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
  }, [open, initialEmployees, initialSupervisor]);

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
    }
  };

  return (
    <PopupLayout
      open={open}
      onClose={onClose}
      title="Manage Team Members"
      subtitle="Add or remove team members and set a supervisor"
      actions={
        <>
          <BaseBtn onClick={onClose} variant="outlined">
            Cancel
          </BaseBtn>
          <BaseBtn onClick={handleSave} variant="contained">
            Save
          </BaseBtn>
        </>
      }
    >
      <Box>
        <SelectedEmployeeChips
          employees={selectedEmployees}
          onRemove={handleRemoveEmployee}
          title="Selected Employees"
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth size='small'>
          <InputLabel id="supervisor-select">Supervisor</InputLabel>
          <Select
            labelId="supervisor-select"
            value={supervisor}
            label="Supervisor"
            onChange={(e) => setSupervisor((e.target.value as string) || '')}
            disabled={selectedEmployees.length === 0}
             MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200,
                            backgroundColor: theme.palette.background.default,
                          },
                        },
                      }}
          >
            {selectedEmployees.map((e) => (
              <MenuItem
                key={e.id}
                value={e.id}
                sx={{ bgcolor: theme.palette.background.default }}
              >
                {e.designation ? `${e.name} - ${e.designation}` : e.name}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="caption">
            Choose a supervisor from selected employees
          </Typography>
        </FormControl>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Add more employees
        </Typography>

        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, email, or designation..."
          label="Search Employees"
          sx={{ mb: 2 }}
        />

        <EmployeeList
          employees={filteredEmployees.filter(
            (e) => !selectedEmployees.some((se) => se.id === e.id)
          )}
          selectedEmployees={selectedEmployees}
          onEmployeeToggle={handleEmployeeToggle}
          searchTerm={searchTerm}
          title="Available Employees"
        />
      </Box>
    </PopupLayout>
  );
}
