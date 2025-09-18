import React, { useState, useEffect } from 'react';
import PopupLayout from '../../templates/popup/PopUpLayout';
import EmployeePicker from '../../molecules/employee/EmployeePicker';
import { IEmployeeProps } from '../../../interfaces/entity/IEmployeeProps';
import BaseBtn from '../../atoms/button/BaseBtn';
import { Box } from '@mui/material';
import { useUsersByRoles } from '../../../hooks/api/useUsers';
import { UserRole } from '@tms/shared';
import Divider from '@mui/material/Divider';
import { AddEmployeePopupProps } from '../../../interfaces/organisms/popup';

const AddEmployeePopup: React.FC<AddEmployeePopupProps> = ({
  open,
  onClose,
  onSave,
  initialSelectedEmployees = [],
  roles = [UserRole.Emp, UserRole.Supervisor],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployeeProps[]>(
    initialSelectedEmployees
  );
  
  const { users } = useUsersByRoles(roles);
  const [filteredEmployees, setFilteredEmployees] = useState<IEmployeeProps[]>(
    []
  );

  useEffect(() => {
    const mapped: IEmployeeProps[] = users.map((u: any) => ({
      id: u._id,
      name: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      designation: u.designation,
    }));
    const filtered = mapped.filter((employee) =>
      [employee.name, employee.email, employee.designation]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, users]);

  useEffect(() => {
    if (open) {
      setSelectedEmployees(initialSelectedEmployees);
      setSearchTerm('');
    }
  }, [open, initialSelectedEmployees]);

  const handleEmployeeToggle = (employee: IEmployeeProps) => {
    const isSelected = selectedEmployees.find((emp) => emp.id === employee.id);

    if (isSelected) {
      setSelectedEmployees(
        selectedEmployees.filter((emp) => emp.id !== employee.id)
      );
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(
      selectedEmployees.filter((emp) => emp.id !== employeeId)
    );
  };

  const handleCancel = () => {
    setSelectedEmployees(initialSelectedEmployees);
    setSearchTerm('');
    onClose();
  };

  return (
    <PopupLayout
      open={open}
      onClose={handleCancel}
      title="Build Your Team"
      subtitle="Search and select employees to add to your Team"
    >
      <Box sx={{ p: 1 }}>
        <EmployeePicker
          users={filteredEmployees}
          selected={selectedEmployees}
          onToggle={handleEmployeeToggle}
          onRemove={handleRemoveEmployee}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </Box>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'flex-end',
          mt: 2,
        }}
      >
        <BaseBtn onClick={handleCancel} variant="outlined">
          Cancel
        </BaseBtn>
        <BaseBtn
          onClick={() => {
            onSave(selectedEmployees);
            onClose();
          }}
          variant="contained"
          disabled={selectedEmployees.length === 0}
        >
          {selectedEmployees.length === 0
            ? 'No Employees Selected'
            : `Add ${selectedEmployees.length} Employee${
                selectedEmployees.length !== 1 ? 's' : ''
              }`}
        </BaseBtn>
      </Box>
    </PopupLayout>
  );
};

export default AddEmployeePopup;
