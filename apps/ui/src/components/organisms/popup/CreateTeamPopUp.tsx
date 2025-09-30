import BaseTextField from '../../atoms/inputField/BaseTextField';
import PopupLayout from '../../templates/popup/PopUpLayout';
import {
  Box,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Divider,
} from '@mui/material';
import EmployeeSection from '../user/EmployeeSection';
import { useState } from 'react';
import { IEmployeeProps } from '../../../interfaces/entity/IEmployeeProps';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import BaseBtn from '../../atoms/button/BaseBtn';
import AddEmployeePopup from './AddEmployeePopup';
import { UserRole } from '@tms/shared';
import { createTeam } from '../../../api/team';
import { useToast } from '../../../contexts/ToastContext';
import { CreateTeamFormData, CreateTeamPopupProps } from '../../../interfaces/organisms/popup';

function CreateDeptPopUp({ open, onClose }: CreateTeamPopupProps) {
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployeeProps[]>(
    []
  );
  const theme = useTheme();
  const toast = useToast();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    reset,
  } = useForm<CreateTeamFormData>({
    mode: 'onChange',
    defaultValues: {
      teamName: '',
      supervisor: '',
    },
  });

  const handleOpenEmployeeDialog = () => {
    setOpenEmployeeDialog(true);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
  };

  const handleCancel = () => {
    onClose();
  };
  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
  };
  const onSubmit = async (data: CreateTeamFormData) => {
    try {
      const response = await createTeam({
        teamName: data.teamName,
        employees: selectedEmployees.map((e) => e.id),
        supervisor: data.supervisor || null,
      });
      
      // Check if team was created successfully
      if (response && response.team) {
        toast.success('Team created successfully');
        reset();
        setSelectedEmployees([]);
        onClose();
      } else {
        toast.error('Failed to create team - Invalid response');
      }
    } catch (error: any) {
      
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        toast.error('Team already exists');
      } else if (error.response?.status === 500) {
        toast.error('Server error while creating team');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create team');
      }
    }
  };

  const handleSaveEmployees = (employees: IEmployeeProps[]) => {
    setSelectedEmployees(employees);
    setOpenEmployeeDialog(false);
  };

  return (
    <>
      <PopupLayout open={open} title="Create Teams" onClose={onClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 5,
              gap: 5,
            }}
          >
            <Controller
              name="teamName"
              control={control}
              render={({ field }) => (
                <BaseTextField
                  {...field}
                  variant="outlined"
                  label="Team Name"
                  placeholder="Team Name"
                  fullWidth
                  sx={{ mb: 1 }}
                />
              )}
            />
            <EmployeeSection
              selectedEmployees={selectedEmployees}
              onAddEmployeesClick={handleOpenEmployeeDialog}
              onRemoveEmployee={handleRemoveEmployee}
            />
            {/* Supervisor Dropdown */}
            <Box sx={{ mb: 1 }}>
              <Controller
                name="supervisor"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="supervisor-select">Supervisor</InputLabel>
                    <Select
                      labelId="supervisor-select"
                      label="Supervisor"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200,
                            backgroundColor: theme.palette.background.default,
                          },
                        },
                      }}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange((e.target.value as string) || null)
                      }
                      disabled={selectedEmployees.length === 0}
                    >
                      {selectedEmployees.map((emp) => (
                        <MenuItem
                          sx={{ bgcolor: theme.palette.background.default }}
                          key={emp.id}
                          value={emp.id}
                        >
                          {emp.designation
                            ? `${emp.name} - ${emp.designation}`
                            : emp.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ m: 0, mt: 0.5 }}>
                      <span style={{ fontSize: '0.75rem' }}>
                        Choose a Team Leader from selected employees
                      </span>
                    </FormHelperText>
                  </FormControl>
                )}
              />
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
              }}
            >
              <BaseBtn
                type="button"
                sx={{ mt: 2 }}
                variant="outlined"
                onClick={handleCancel}
              >
                Cancel
              </BaseBtn>
              <BaseBtn
                type="submit"
                sx={{ mt: 2 }}
                disabled={!isValid || isSubmitting}
              >
                Create
              </BaseBtn>
            </Box>
          </Box>
        </form>
      </PopupLayout>
      {/* Add Employee Popup */}
      <AddEmployeePopup
        open={openEmployeeDialog}
        onClose={handleCloseEmployeeDialog}
        onSave={handleSaveEmployees}
        initialSelectedEmployees={selectedEmployees}
        roles={[UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin]}
      />
    </>
  );
}

export default CreateDeptPopUp;
