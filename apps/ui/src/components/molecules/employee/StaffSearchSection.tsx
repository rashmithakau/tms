import React from 'react';
import SearchField from '../other/SearchField';
import EmployeeList from './EmployeeList';
import type { IStaffSearchSectionProps } from '../../../interfaces/component/employee';

const StaffSearchSection: React.FC<IStaffSearchSectionProps> = ({
  searchTerm,
  onSearchChange,
  availableStaff,
  selectedStaff,
  onStaffToggle,
  staffType,
}) => {
  const filteredAvailableStaff = availableStaff.filter(
    (e) => !selectedStaff.some((se) => se.id === e.id)
  );

  return (
    <>
      <SearchField
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search by name, email, or designation..."
        label="Search Employees"
        sx={{ mb: 2 }}
      />

      <EmployeeList
        employees={filteredAvailableStaff}
        selectedEmployees={selectedStaff}
        onEmployeeToggle={onStaffToggle}
        searchTerm={searchTerm}
        title="Available Employees"
      />
    </>
  );
};

export default StaffSearchSection;