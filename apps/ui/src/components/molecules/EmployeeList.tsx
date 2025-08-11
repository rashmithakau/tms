import React from 'react';
import {
  Box,
  List,
  Typography,
} from '@mui/material';
import EmployeeListItem from './EmployeeListItem';
import { IEmployeeListProps } from '../../interfaces/IEmployeeListProps';
import theme from '../../styles/theme';

const EmployeeList: React.FC<IEmployeeListProps> = ({
  employees,
  selectedEmployees,
  onEmployeeToggle,
  title ,
  emptyMessage ,
  searchTerm,
  maxHeight = 300,
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          maxHeight,
          border: `0.5px  ${theme.palette.divider}`,
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