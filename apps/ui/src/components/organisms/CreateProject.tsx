import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import FormLayout from '../templates/FormLayout';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import { Box } from '@mui/material';
import BaseBtn from '../atoms/buttons/BaseBtn';
import AddEmployeePopup from './AddEmployeePopup';
import ProjectEmployeesSection from './ProjectEmployeesSection';
import { IEmployeeProps } from '../../interfaces/IEmployeeProps';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateProjectFormSchema from '../../validations/CreateProjectFormSchema';
import { Controller } from 'react-hook-form';
import { FormHelperText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
type CreateProjectFormData = {
  projectName: string;
  billable: 'yes' | 'no';
};

const CreateProject: React.FC = () => {
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployeeProps[]>(
    []
  );
  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<CreateProjectFormData>({
    resolver: yupResolver(CreateProjectFormSchema),
    defaultValues: {
      projectName: '',
      billable: undefined,
    },
  });

  // Form submission handler
  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      // Add selected employees to form data
      // TODO: Call your API here
      // await createProject(formDataWithEmployees);
      // Success handling
    } catch (error) {
      //error handling
    }
  };

  const handleOpenEmployeeDialog = () => {
    setOpenEmployeeDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
  };

  const handleSaveEmployees = (employees: IEmployeeProps[]) => {
    setSelectedEmployees(employees);
  };

  const handleRemoveEmployee = (employeeId: number) => {
    setSelectedEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
  };
  const theme = useTheme();
  return (
    <>
      <FormLayout
        title="Create New Project"
        formContent={
          <Box
            sx={{
              width: '100%',
              maxWidth: '500px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: 2,
              overflow: 'hidden',
            }}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Project Name Field */}
            <Controller
              name="projectName"
              control={control}
              render={({ field }) => (
                <BaseTextField
                  {...field}
                  label="Project Name"
                  placeholder="Enter Project Name"
                  variant="outlined"
                  id="project-name"
                  error={!!errors.projectName}
                  helperText={errors.projectName?.message || ' '}
                />
              )}
            />

            {/* Billable Dropdown */}
            <Box sx={{ mb: 1 }}>
              <Controller
                name="billable"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={!!errors.billable}
                  >
                    <InputLabel required>Billable</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      label="Billable"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200,
                            backgroundColor: theme.palette.background.default,
                          },
                        },
                      }}
                    >
                      <MenuItem
                        value="yes"
                        id="yes-option"
                        sx={{
                          backgroundColor: theme.palette.background.default,
                          '&:hover': {
                            backgroundColor: theme.palette.background.paper,
                          },
                        }}
                      >
                        Yes
                      </MenuItem>
                      <MenuItem
                        value="no"
                        id="no-option"
                        sx={{
                          backgroundColor: theme.palette.background.default,
                          '&:hover': {
                            backgroundColor: theme.palette.background.paper,
                          },
                        }}
                      >
                        No
                      </MenuItem>
                    </Select>
                    {errors.billable && (
                      <FormHelperText>{errors.billable.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            {/* Employee Section */}
            <ProjectEmployeesSection
              selectedEmployees={selectedEmployees}
              onAddEmployeesClick={handleOpenEmployeeDialog}
              onRemoveEmployee={handleRemoveEmployee}
            />

            {/* Submit Button */}
            <BaseBtn
              type="submit"
              sx={{ mt: 2 }}
              disabled={!isValid || isSubmitting}
              fullWidth={true}
            >
              Create Project
            </BaseBtn>
          </Box>
        }
      />

      {/* Add Employee Popup */}
      <AddEmployeePopup
        open={openEmployeeDialog}
        onClose={handleCloseEmployeeDialog}
        onSave={handleSaveEmployees}
        initialSelectedEmployees={selectedEmployees}
      />
    </>
  );
};

export default CreateProject;
