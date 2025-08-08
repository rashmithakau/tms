import FormLayout from '../templates/FormLayout';
import { Box } from '@mui/material';
import BaseBtn from '../atoms/buttons/BaseBtn';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import NumberField from '../atoms/inputFields/NumberField';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateEmployeeFormSchema from '../../validations/CreateEmployeeFormSchema';

type CreateEmployeeData = {
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  contactNumber: string;
  designation: string;
};
const fieldVariants = {
  primary: 'standard' as const,
};

const CreateEmployee: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateEmployeeData>({
    resolver: yupResolver(CreateEmployeeFormSchema),
    mode: 'onChange', // enables real-time validation
  });
  const onSubmit = (data: CreateEmployeeData) => {
    //logic to handle form submission
  };

  return (
    <FormLayout
      title="Create Employee"
      formContent={
        <Box sx={{ padding: 4 , maxWidth: 600, width: '100%' }}>
          {/*  input field */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
           
              <BaseTextField
                variant={fieldVariants.primary}
                sx={{ mb: 2 }}
                label="First Name"
                placeholder="Enter First Name"
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
              <BaseTextField
                variant={fieldVariants.primary}
                sx={{ mb: 2 }}
                label="Last Name"
                placeholder="Enter Last Name"
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
        

            <BaseTextField
              variant={fieldVariants.primary}
              sx={{ mb: 2 }}
              label="Employee ID"
              placeholder="Enter Employee ID"
              {...register('employeeId')}
              error={!!errors.employeeId}
              helperText={errors.employeeId?.message}
            />
            <BaseTextField
              variant={fieldVariants.primary}
              sx={{ mb: 2 }}
              label="Email"
              placeholder="Enter Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <NumberField
              variant={fieldVariants.primary}
              sx={{ mb: 2 }}
              label="Contact Number"
              placeholder="Enter Contact Number"
              {...register('contactNumber')}
              error={!!errors.contactNumber}
              helperText={errors.contactNumber?.message}
            />
            <BaseTextField
              variant={fieldVariants.primary}
              sx={{ mb: 2 }}
              label="Designation"
              placeholder="Enter Designation"
              {...register('designation')}
              error={!!errors.designation}
              helperText={errors.designation?.message}
            />

            <BaseBtn type="submit" disabled={!isValid || isSubmitting}>
              Create Employee
            </BaseBtn>
          </form>
        </Box>
      }
    />
  );
};

export default CreateEmployee;
