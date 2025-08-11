import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import BaseBtn from '../atoms/buttons/BaseBtn';
import theme from '../../styles/theme';

import { IProjectEmployeesSectionProps } from '../../interfaces/IProjectEmployeesSectionProps';

const ProjectEmployeesSection: React.FC<IProjectEmployeesSectionProps> = ({
  selectedEmployees,
  onAddEmployeesClick,
  onRemoveEmployee,
  title = 'Project Employees',
  addButtonText = 'Add Employees',
  emptyMessage = 'No employees assigned to this project yet.',
  height = '120px',
}) => {
  return (
    <Box sx={{ mb: 1 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary }}
        >
          {title}
        </Typography>
        <BaseBtn variant="outlined"  onClick={onAddEmployeesClick}>
          {addButtonText}
        </BaseBtn>
      </Box>

      {/* Scrollable Employee List Container */}
      <Box
        sx={{
          height,
          overflow: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          p: 1,
          backgroundColor: '#fafafa',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: '#a1a1a1',
            },
          },
        }}
      >
        {selectedEmployees.length > 0 ? (
          <Box sx={{ height: '100%' }}>
            {/* Employee Count Header */}
            <Typography
              variant="body2"
              color={theme.palette.text.secondary}
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              {selectedEmployees.length} employee
              {selectedEmployees.length !== 1 ? 's' : ''} assigned
            </Typography>

            {/* Employee List */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
              }}
            >
              {selectedEmployees.map((employee) => (
                <Box
                  key={employee.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    backgroundColor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    minHeight: '36px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  {/* Employee Information */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {employee.name}
                    </Typography>
                    <Typography
                      variant="caption"
                    
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {employee.designation}
                    </Typography>
                  </Box>

                  {/* Remove Button */}
                  <Box sx={{ ml: 1 }}>
                    <Chip
                      label="Remove"
                      onDelete={() => onRemoveEmployee(employee.id)}
                      size="small"
                      variant="outlined"
                      color="secondary"
                      sx={{
                        height: '24px',
                        '& .MuiChip-deleteIcon': {
                          fontSize: '16px',
                        },
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          /* Empty State */
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              {emptyMessage}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProjectEmployeesSection;
