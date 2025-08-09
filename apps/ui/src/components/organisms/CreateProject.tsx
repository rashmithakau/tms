import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
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
type CreateProjectFormData = {
  projectName: string;
  billable: 'yes' | 'no';
  timeSheets: 'yes' | 'no';
  isScrum: 'yes' | 'no';
};
const radioGroups = [
  {
    label: 'Billable',
    name: 'billable',
    options: [
      { value: 'yes', label: 'Yes', id: 'billable-yes' },
      { value: 'no', label: 'No', id: 'billable-no' },
    ],
  },
  {
    label: 'Time Sheets',
    name: 'timeSheets',
    options: [
      { value: 'yes', label: 'Yes', id: 'timeSheets-yes' },
      { value: 'no', label: 'No', id: 'timeSheets-no' },
    ],
  },
  {
    label: 'Is Scrum Project',
    name: 'isScrum',
    options: [
      { value: 'yes', label: 'Yes', id: 'scrum-yes' },
      { value: 'no', label: 'No', id: 'scrum-no' },
    ],
  },
];
const CreateProject: React.FC = () => {
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployeeProps[]>(
    []
  );
  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting ,isValid},
    reset,
  } = useForm<CreateProjectFormData>({
    resolver: yupResolver(CreateProjectFormSchema),
    defaultValues: {
      projectName: '',
      billable: undefined,
      timeSheets: undefined,
      isScrum: undefined,
    },
  });

  // Form submission handler
  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      // Add selected employees to form data
      const formDataWithEmployees = {
        ...data,
        employees: selectedEmployees,
      };

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

  return (
    <>
      <FormLayout
        title="Create New Project"
        formContent={
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 4 }}
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
                    variant="standard"
                    id="project-name"
                    error={!!errors.projectName}
                    helperText={errors.projectName?.message || ' '}
                  />
               
              )}
            />

            {/* Radio Groups */}
            <FormControl component="fieldset" >
              {radioGroups.map((group) => (
                <Box key={group.name} >
                  <FormLabel
                    component="legend"
                    error={!!errors[group.name as keyof CreateProjectFormData]}
                    required
                  >
                    {group.label}
                  </FormLabel>
                  <Controller
                    name={group.name as keyof CreateProjectFormData}
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row value={field.value || ''}>
                        {group.options.map((option) => (
                          <FormControlLabel
                            key={option.id}
                            value={option.value}
                            control={<Radio />}
                            label={option.label}
                            id={option.id}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors[group.name as keyof CreateProjectFormData] && (
                    <FormHelperText error >
                      {
                        errors[group.name as keyof CreateProjectFormData]
                          ?.message
                      }
                    </FormHelperText>
                  )}
                </Box>
              ))}
            </FormControl>

            {/* Employee Section */}
            <ProjectEmployeesSection
              selectedEmployees={selectedEmployees}
              onAddEmployeesClick={handleOpenEmployeeDialog}
              onRemoveEmployee={handleRemoveEmployee}
            />

            {/* Submit Button */}
            <BaseBtn type="submit" sx={{ mt: 2 }} disabled={!isValid || isSubmitting}>
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
