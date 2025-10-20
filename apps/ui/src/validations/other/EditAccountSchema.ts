import * as yup from 'yup';

export const EditAccountSchema = yup.object({
  designation: yup.string().trim().required('Designation is required'),
  contactNumber: yup.string().trim().required('Contact number is required'),
  status: yup.mixed<'Active' | 'Inactive'>().oneOf(['Active', 'Inactive']).required('Status is required'),
});