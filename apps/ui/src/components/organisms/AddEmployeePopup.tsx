import React, { useState, useEffect } from 'react';
import PopupLayout from '../templates/PopUpLayout';
import SearchField from '../molecules/SearchField';
import SelectedEmployeeChips from '../molecules/SelectedEmployeeChips';
import EmployeeList from '../molecules/EmployeeList';
import { IAddEmployeePopupProps } from '../../interfaces/IAddEmployeePopupProps';
import { IEmployeeProps } from '../../interfaces/IEmployeeProps';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useUsersByRoles } from '../../hooks/useUsers';
import { UserRole } from '@tms/shared';
import Divider from '@mui/material/Divider';
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
  const theme = useTheme();

  // Fetch both employees and supervisors
  const { users } = useUsersByRoles([UserRole.Emp, UserRole.Supervisor]);
  const [filteredEmployees, setFilteredEmployees] = useState<IEmployeeProps[]>(
    []
  );

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
      title="Build Your Project Team"
      subtitle="Search and select employees to add to your project"
    >
      <Box sx={{ p: 1 }}>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Box
            sx={{
              display: 'flex',

              mb: 2,
            }}
          >
            <Avatar
              sx={{
                backgroundColor: theme.palette.text.secondary,
                color: theme.palette.background.default,
                width: 50,
                height: 50,
                mr: 2,
              }}
            >
              <GroupIcon sx={{ fontSize: 25 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: theme.palette.text.primary }}
              >
                Team Selection
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                Available: {users.length} employees
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Find Employees
            </Typography>
          </Box>

          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, email, or designation..."
            label="Search Employees"
          />

          {searchTerm && (
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              Showing {filteredEmployees.length} result
              {filteredEmployees.length !== 1 ? 's' : ''} for "{searchTerm}"
            </Typography>
          )}
        </Paper>

        {/* Selected Employees Section */}
        {selectedEmployees.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: theme.palette.text.primary }}
              >
                Selected Team Members
              </Typography>
            </Box>

            <SelectedEmployeeChips
              employees={selectedEmployees}
              onRemove={handleRemoveEmployee}
              title=""
              sx={{ mb: 0 }}
            />
          </Paper>
        )}

        {/* Employee List Section */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Box
            sx={{
              mt: 2,
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Available Employees
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
            >
              Click on employees to add them to your project team
            </Typography>
          </Box>

          <EmployeeList
            employees={filteredEmployees}
            selectedEmployees={selectedEmployees}
            onEmployeeToggle={handleEmployeeToggle}
            title=""
            searchTerm={searchTerm}
          />
        </Paper>
      </Box>
      <Box>
        <Divider />
      </Box>
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
