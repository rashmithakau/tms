import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import SelectedEmployeeChips from './SelectedEmployeeChips';
import EmployeeList from './EmployeeList';
import SearchField from './SearchField';
import { IEmployeeProps } from '../../interfaces/IEmployeeProps';

interface StaffSelectorProps {
  selectedEmployees: IEmployeeProps[];
  availableEmployees: IEmployeeProps[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEmployeeToggle: (employee: IEmployeeProps) => void;
  onRemoveEmployee: (employeeId: string) => void;
  title?: string;
  searchPlaceholder?: string;
  searchLabel?: string;
}

const StaffSelector: React.FC<StaffSelectorProps> = ({
  selectedEmployees,
  availableEmployees,
  searchTerm,
  onSearchChange,
  onEmployeeToggle,
  title = "Add more employees",
  searchPlaceholder = "Search by name, email, or designation...",
  searchLabel = "Search Employees",
}) => {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      <SearchField
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        label={searchLabel}
        sx={{ mb: 2 }}
      />

      <EmployeeList
        employees={availableEmployees.filter(
          (e) => !selectedEmployees.some((se) => se.id === e.id)
        )}
        selectedEmployees={selectedEmployees}
        onEmployeeToggle={onEmployeeToggle}
        searchTerm={searchTerm}
        title="Available Employees"
      />
    </>
  );
};

export default StaffSelector;