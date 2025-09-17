import React, { useState } from 'react';
import { Box } from '@mui/material';
import BaseTextField from '../../atoms/inputField/BaseTextField';
import BaseBtn from '../../atoms/button/BaseBtn';
import AddEmployeePopup from './AddEmployeePopup';
import EmployeeSection from '../user/EmployeeSection';
import { IEmployeeProps } from '../../../interfaces/entity/IEmployeeProps';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateProjectFormSchema from '../../../validations/project/CreateProjectFormSchema';
import { useTheme } from '@mui/material/styles';
import PopupLayout from '../../templates/popup/PopUpLayout';
import { createProject } from '../../../api/project';
import { useToast } from '../../../contexts/ToastContext';
import Divider from '@mui/material/Divider';
import { UserRole } from '@tms/shared';
import SupervisorSelect from '../../molecules/supervisor/SupervisorSelect';
import BillableSelect from '../../molecules/other/BillableSelect';

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
  const toast = useToast();

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
      toast.success('Project created');
      onClose(); // Close popup after submit
      reset();
      setSelectedEmployees([]); // Clear selected employees
    } catch (error) {
      toast.error('Failed to create project');
      setSelectedEmployees([]); // Clear selected employees
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
      <PopupLayout open={open} title="Create Project" onClose={handleCancel}>
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
                  <BillableSelect
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.billable}
                    helperText={errors.billable?.message}
                  />
                )}
              />
            </Box>

            {/* Employee Section */}
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
                  <SupervisorSelect
                    employees={selectedEmployees}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={selectedEmployees.length === 0}
                  />
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
        roles={[UserRole.Emp, UserRole.Supervisor]}
      />
    </>
  );
};

export default CreateProjectPopUp;
