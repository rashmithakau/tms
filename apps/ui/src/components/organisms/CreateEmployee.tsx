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
  primary: 'outlined' as const,
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            maxWidth: 500,
            width: '100%',
            padding: 2,
            overflow: 'hidden',
            height: '100%',
          }}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* input fields */}
          <BaseTextField
            variant={fieldVariants.primary}
            label="First Name"
            placeholder="Enter First Name"
            {...register('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName?.message || ' '}
            fullWidth
          />
          <BaseTextField
            variant={fieldVariants.primary}
            label="Last Name"
            placeholder="Enter Last Name"
            {...register('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName?.message || ' '}
            fullWidth
          />

          <BaseTextField
            variant={fieldVariants.primary}
            label="Employee ID"
            placeholder="Enter Employee ID"
            {...register('employeeId')}
            error={!!errors.employeeId}
            helperText={errors.employeeId?.message || ' '}
            fullWidth
          />
          <BaseTextField
            variant={fieldVariants.primary}
            label="Email"
            placeholder="Enter Email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message || ' '}
            fullWidth
          />

          <NumberField
            variant={fieldVariants.primary}
            label="Contact Number"
            placeholder="Enter Contact Number"
            {...register('contactNumber')}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber?.message || ' '}
            fullWidth
          />
          <BaseTextField
            variant={fieldVariants.primary}
            label="Designation"
            placeholder="Enter Designation"
            {...register('designation')}
            error={!!errors.designation}
            helperText={errors.designation?.message || ' '}
            fullWidth
          />

          <BaseBtn
            type="submit"
            disabled={!isValid || isSubmitting}
            fullWidth={true}
          >
            Create Employee
          </BaseBtn>
        </Box>
      }
    />
  );
};

export default CreateEmployee;
