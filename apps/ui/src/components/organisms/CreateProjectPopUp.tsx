import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
} from '@mui/material';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import BaseBtn from '../atoms/buttons/BaseBtn';
import AddEmployeePopup from './AddEmployeePopup';
import ProjectEmployeesSection from './ProjectEmployeesSection';
import { IEmployeeProps } from '../../interfaces/IEmployeeProps';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateProjectFormSchema from '../../validations/CreateProjectFormSchema';
import { useTheme } from '@mui/material/styles';
import PopupLayout from '../templates/PopUpLayout';
import { createProject } from '../../api/project';

interface CreateProjectFormData {
  projectName: string;
  billable: 'yes' | 'no';
  supervisor: string | null;
}

const CreateProjectPopUp: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployeeProps[]>(
    []
  );
  const theme = useTheme();

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<CreateProjectFormData>({
    resolver: yupResolver(CreateProjectFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
   
  });

  // Form submission handler
  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      await createProject({
        projectName: data.projectName,
        billable: data.billable,
        employees: selectedEmployees.map((e) => e.id),
        supervisor: data.supervisor ?? null,
      });
      onClose(); // Close popup after submit
      reset();
      setSelectedEmployees([]); // Clear selected employees
    } catch (error) {
      // error handling
    }
  };

  const handleCancel = () => {
    onClose();
    reset();
    setSelectedEmployees([]);
  };

  const handleOpenEmployeeDialog = () => {
    setOpenEmployeeDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
  };

  const handleSaveEmployees = (employees: IEmployeeProps[]) => {
    setSelectedEmployees(employees);
    setOpenEmployeeDialog(false);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
  };

  return (
    <>
      <PopupLayout
        open={open}
        title="Create Project"
        onClose={handleCancel}
        actions={null} // Submit button is inside the form
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 5,
              gap: 5,
            }}
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
                    <InputLabel required id="billable-label">Billable</InputLabel>
                    <Select
                      {...field}
                      labelId="billable-label"
                      value={field.value}
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
            {/* Supervisor Dropdown */}
            <Box sx={{ mt: 2 }}>
              <Controller
                name="supervisor"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="supervisor-label">Supervisor</InputLabel>
                    <Select
                      labelId="supervisor-label"
                      label="Supervisor"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange((e.target.value as string) || null)
                      }
                      displayEmpty
                      disabled={selectedEmployees.length === 0}
                    >
                     
                      {selectedEmployees.map((emp) => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.designation
                            ? `${emp.name} - ${emp.designation}`
                            : emp.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      Choose a supervisor from selected employees. You can add employees above.
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Box>

            {/* Submit Button */}
            <BaseBtn
              type="submit"
              sx={{ mt: 2 }}
              disabled={!isValid || isSubmitting}
              fullWidth={true}
            >
              Create Project
            </BaseBtn>
            <BaseBtn
              type="button"
              sx={{ mt: 1 }}
              variant="outlined"
              onClick={handleCancel}
              fullWidth={true}
            >
              Cancel
            </BaseBtn>
          </Box>
        </form>
      </PopupLayout>

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

export default CreateProjectPopUp;
