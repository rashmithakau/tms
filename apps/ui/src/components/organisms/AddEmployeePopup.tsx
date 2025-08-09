import React, { useState, useEffect } from 'react';
import PopupLayout from '../templates/PopUpLayout';
import SearchField from '../molecules/SearchField';
import SelectedEmployeeChips from '../molecules/SelectedEmployeeChips';
import EmployeeList from '../molecules/EmployeeList';
import DialogActions from '../molecules/DialogActions';
import { IAddEmployeePopupProps } from '../../interfaces/IAddEmployeePopupProps';
import { IEmployeeProps } from '../../interfaces/IEmployeeProps';

// Mock employee data
const allEmployees = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@company.com',
    designation: 'Senior Software Engineer',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@company.com',
    designation: 'Software Engineer',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@company.com',
    designation: 'QA Engineer',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah@company.com',
    designation: 'Project Manager',
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david@company.com',
    designation: 'Tech Lead',
  },
  {
    id: 6,
    name: 'Emily Davis',
    email: 'emily@company.com',
    designation: 'Associate Software Engineer',
  },
];

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
  const [filteredEmployees, setFilteredEmployees] =
    useState<IEmployeeProps[]>(allEmployees);

  // Filter employees based on search term
  useEffect(() => {
    const filtered = allEmployees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm]);

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

  const handleRemoveEmployee = (employeeId: number) => {
    setSelectedEmployees(
      selectedEmployees.filter((emp) => emp.id !== employeeId)
    );
  };

  const handleSave = () => {
    onSave(selectedEmployees);
    onClose();
  };

  const handleCancel = () => {
    setSelectedEmployees(initialSelectedEmployees);
    setSearchTerm('');
    onClose();
  };

  const dialogActions = (
    <DialogActions
      onCancel={handleCancel}
      onSave={handleSave}
      saveDisabled={selectedEmployees.length === 0}
      selectedCount={selectedEmployees.length}
    />
  );

  return (
    <PopupLayout
      open={open}
      onClose={handleCancel}
      title="Add Employees"
      subtitle="Search and select employees to add to your project"
      maxWidth="md"
      fullWidth
      minHeight="600px"
      actions={dialogActions}
    >
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
        title="Available Employees"
        searchTerm={searchTerm}
      />
    </PopupLayout>
  );
};

export default AddEmployeePopup;