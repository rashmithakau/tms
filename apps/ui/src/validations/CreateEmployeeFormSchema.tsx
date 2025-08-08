import * as yup from 'yup';
import { contactField, emailField } from './TextFieldSchema';

const CreateEmployeeFormSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  employeeId: yup.string().required('Employee ID is required'),
  email: emailField,
  contactNumber: contactField,
  designation: yup.string().required('Designation is required'),
});

export default CreateEmployeeFormSchema;
