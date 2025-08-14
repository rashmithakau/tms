
import PopupLayout from '../templates/PopUpLayout';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import NumberField from '../atoms/inputFields/NumberField';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { registerUser } from '../../api/user';
import { UserRole } from '@tms/shared';
import { useEffect } from 'react';
import CreateAccountFormSchema from '../../validations/CreateAccountFormSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/material';
type CreateAccountData = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  designation: string;
};  
function CreateAccountPopup({
  open,
  role,
  onClose,
}: {
  open: boolean;
  role: UserRole;
  onClose: () => void;
}) {
  const title = `${role === 'admin' ? 'Create Admin' : 'Create Employee'}`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateAccountData>({
    resolver: yupResolver(CreateAccountFormSchema),
    mode: 'onChange',

function CreateAccountPopup({ open ,role}: { open: boolean;role:UserRole ;onClose: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    designation: '',
    contactNumber: '',

  });

  // Reset form when popup closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = (data: CreateAccountData) => {
    registerUser({

      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      designation: data.designation,
      contactNumber: data.contactNumber,
      role: { role },
    });
    onClose(); // Close popup after submit

      "email": formData.email,
      "firstName": formData.firstName,
      "lastName": formData.lastName,
      "designation": formData.designation,
      "contactNumber": formData.contactNumber
    },role);


  };

  const handleCancel = () => {
    onClose();
  };

  return (
   <PopupLayout
    open={open}
    title={title}
    maxWidth="sm"
    minHeight="350px"
    maxHeight="600px"
    onClose={onClose}
    actions={
      <>
        <BaseBtn type="button" onClick={handleCancel} variant="outlined">
          Cancel
        </BaseBtn>
        <BaseBtn type="submit"> {title}</BaseBtn>
      </>
    }
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
          <BaseTextField
            variant="outlined"
            label="Email"
            placeholder="Email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message || ' '}
            fullWidth
          />
          <BaseTextField
            variant="outlined"
            label="First Name"
            placeholder="First Name"
            {...register('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName?.message || ' '}
            fullWidth
          />
          <BaseTextField
            variant="outlined"
            label="Last Name"
            placeholder="Last Name"
            {...register('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName?.message || ' '}
            fullWidth
          />
          <BaseTextField
            variant="outlined"
            label="Designation"
            placeholder="Designation"
            {...register('designation')}
            error={!!errors.designation}
            helperText={errors.designation?.message || ' '}
            fullWidth
          />
          <NumberField
            variant="outlined"
            label="Contact Number"
            placeholder="Contact Number"
            {...register('contactNumber')}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber?.message || ' '}
            fullWidth
          />
        </Box>
      </form>
    </PopupLayout>
  );
}

export default CreateAccountPopup;
