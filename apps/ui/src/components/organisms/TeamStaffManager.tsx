import { useEffect, useMemo, useState } from 'react';
import { Box, Divider } from '@mui/material';
import PopupLayout from '../templates/PopUpLayout';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useUsersByRoles } from '../../hooks/useUsers';
import { UserRole } from '@tms/shared';
import { updateTeamStaff } from '../../api/team';
import { IEmployeeProps } from '../../interfaces/IEmployeeProps';
import { useToast } from '../contexts/ToastContext';
import StaffSelector from '../molecules/StaffSelector';
import SupervisorSelector from '../molecules/SupervisorSelector';
import SelectedEmployeeChips from '../molecules/SelectedEmployeeChips';

export default function TeamStaffManager({
  open,
  onClose,
  teamId,
  initialMembers,
  initialSupervisor,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  teamId: string;
  initialMembers: { id: string; name: string; designation?: string }[];
  initialSupervisor: { id: string; name: string; designation?: string } | null;
  onSaved?: () => void;
}) {
  const { users } = useUsersByRoles([UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<IEmployeeProps[]>([]);
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
      setSelectedMembers(
        initialMembers.map(
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
  }, [open, initialMembers, initialSupervisor, employeeOptions]);

  const filteredEmployees = useMemo(() => {
    const lc = searchTerm.toLowerCase();
    return employeeOptions.filter((e) =>
      [e.name, e.email, e.designation]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(lc))
    );
  }, [employeeOptions, searchTerm]);

  const handleEmployeeToggle = (employee: IEmployeeProps) => {
    setSelectedMembers((prev) => {
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
    setSelectedMembers((prev) => prev.filter((e) => e.id !== employeeId));
    if (supervisor === employeeId) setSupervisor('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateTeamStaff(teamId, {
        members: selectedMembers.map((e) => e.id),
        supervisor: supervisor || null,
      });
      toast.success('Team staff updated');
      onSaved && onSaved();
      onClose();
    } catch (e) {
      toast.error('Failed to update team staff');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PopupLayout
      open={open}
      onClose={onClose}
      title="Manage Team Members"
      subtitle="Add or remove team members and set a supervisor"
    >
      <Box>
        <SelectedEmployeeChips
          employees={selectedMembers}
          onRemove={handleRemoveEmployee}
          title="Selected Employees"
          sx={{ mb: 2 }}
        />
        <SupervisorSelector
          selectedEmployees={selectedMembers}
          supervisor={supervisor}
          onSupervisorChange={setSupervisor}
          caption="Choose a supervisor from selected team members"
        />
        <StaffSelector
          selectedEmployees={selectedMembers}
          availableEmployees={filteredEmployees}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEmployeeToggle={handleEmployeeToggle}
          onRemoveEmployee={handleRemoveEmployee}
          title="Add more team members"
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
