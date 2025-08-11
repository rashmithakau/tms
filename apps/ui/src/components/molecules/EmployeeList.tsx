import React from 'react';
import {
  Box,
  List,
  Typography,
} from '@mui/material';
import EmployeeListItem from './EmployeeListItem';
import { IEmployeeListProps } from '../../interfaces/IEmployeeListProps';
import { useTheme } from '@mui/material/styles';

const EmployeeList: React.FC<IEmployeeListProps> = ({
  employees,
  selectedEmployees,
  onEmployeeToggle,
  title ,
  emptyMessage ,
  searchTerm,
  maxHeight = 300,
}) => {
  const theme = useTheme();
  return (
    <>
      <Typography variant="h6" >
        {title}
      </Typography>
      <Box
        sx={{
          maxHeight,
          
        }}
      >
        <List>
          {employees.map((employee) => {
            const isSelected = selectedEmployees.find(
              (emp) => emp.id === employee.id
            );
            return (
              <EmployeeListItem
                key={employee.id}
                employee={employee}
                isSelected={!!isSelected}
                onToggle={onEmployeeToggle}
              />
            );
          })}
        </List>

        {employees.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color={theme.palette.text.secondary}>
              {searchTerm 
                ? `No employees found matching "${searchTerm}"`
                : emptyMessage
              }
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default EmployeeList;