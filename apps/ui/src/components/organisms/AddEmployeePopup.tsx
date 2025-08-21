import React, { useState, useEffect } from 'react';
import PopupLayout from '../templates/PopUpLayout';
import SearchField from '../molecules/SearchField';
import SelectedEmployeeChips from '../molecules/SelectedEmployeeChips';
import EmployeeList from '../molecules/EmployeeList';
import { IAddEmployeePopupProps } from '../../interfaces/IAddEmployeePopupProps';
import { IEmployeeProps } from '../../interfaces/IEmployeeProps';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { Box } from '@mui/material';
import { useUsersByRoles } from '../../hooks/useUsers';
import { UserRole } from '@tms/shared';



const AddEmployeePopup: React.FC<IAddEmployeePopupProps> = ({
  open,
  onClose,
  onSave,
  initialSelectedEmployees = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployeeProps[]>(
    initialSelectedEmployees
  );
  // Fetch both employees and supervisors
  const { users } = useUsersByRoles([UserRole.Emp, UserRole.Supervisor]);
  const [filteredEmployees, setFilteredEmployees] =
    useState<IEmployeeProps[]>([]);

  // Filter employees based on search term
 // Filter employees based on search term
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

  // Reset selected employees when popup opens
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
      title="Add Employees"
      subtitle="Search and select employees to add to your project"
      actions={
        <>
          <BaseBtn onClick={handleCancel} variant="outlined">
            Cancel
          </BaseBtn>
          <BaseBtn
            onClick={() => {
              onSave(selectedEmployees);
              onClose(); // Close the popup after saving
            }}
            variant="contained"
          >
            Add Employees
          </BaseBtn>
        </>
      }
    >
      <Box></Box>
      {/* Search Field */}
      <SearchField
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by name, email, or designation..."
        label="Search Employees"
        sx={{ mb: 3 }}
      />

      {/* Selected Employees */}
      <SelectedEmployeeChips
        employees={selectedEmployees}
        onRemove={handleRemoveEmployee}
        title="Selected Employees"
        sx={{ mb: 3 }}
      />

      {/* Employee List */}
      <EmployeeList
        employees={filteredEmployees}
        selectedEmployees={selectedEmployees}
        onEmployeeToggle={handleEmployeeToggle}
        title="All Employees"
        searchTerm={searchTerm}
      />
    </PopupLayout>
  );
};

export default AddEmployeePopup;
