import { emailField } from "../other/TextFieldSchema";
import * as yup from 'yup';

const ResetPasswordFormSchema = yup.object().shape({
  email: emailField
});

export default ResetPasswordFormSchema;