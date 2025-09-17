import { useEffect, useMemo, useState } from 'react';
import { useUsersByRoles } from '../api/useUsers';
import { UserRole } from '@tms/shared';
import { IEmployeeProps } from '../../interfaces/entity/IEmployeeProps';
import { useToast } from '../../contexts/ToastContext';
import { UseStaffManagerProps } from '../../interfaces';

export const useStaffManager = ({
  open,
  initialStaff,
  initialSupervisor,
  onSave,
}: UseStaffManagerProps) => {
  const { users } = useUsersByRoles([UserRole.Emp, UserRole.Supervisor]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<IEmployeeProps[]>([]);
  const [supervisor, setSupervisor] = useState<string | ''>('');
  const toast = useToast();

  const staffOptions: IEmployeeProps[] = useMemo(
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
      setSelectedStaff(
        initialStaff.map(
          (e) =>
            staffOptions.find((o) => o.id === e.id) || {
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
  }, [open, initialStaff, initialSupervisor, staffOptions]);

  const filteredStaff = useMemo(() => {
    const lc = searchTerm.toLowerCase();
    return staffOptions.filter((e) =>
      [e.name, e.email, e.designation]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(lc))
    );
  }, [staffOptions, searchTerm]);

  const handleStaffToggle = (staff: IEmployeeProps) => {
    setSelectedStaff((prev) => {
      const exists = prev.some((e) => e.id === staff.id);
      if (exists) {
        const updated = prev.filter((e) => e.id !== staff.id);
        if (supervisor === staff.id) setSupervisor('');
        return updated;
      }
      return [...prev, staff];
    });
  };

  const handleRemoveStaff = (staffId: string) => {
    setSelectedStaff((prev) => prev.filter((e) => e.id !== staffId));
    if (supervisor === staffId) setSupervisor('');
  };

  const handleSave = async () => {
    try {
      await onSave(
        selectedStaff.map((e) => e.id),
        supervisor || null
      );
      toast.success('Staff updated successfully');
    } catch (e) {
      toast.error('Failed to update staff');
    }
  };

  return {
    selectedStaff,
    supervisor,
    searchTerm,
    filteredStaff,
    setSupervisor,
    setSearchTerm,
    handleStaffToggle,
    handleRemoveStaff,
    handleSave,
  };
};