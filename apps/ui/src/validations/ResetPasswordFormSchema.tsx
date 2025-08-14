import { de } from "zod/v4/locales/index.cjs";
import { emailField } from "./TextFieldSchema";
import * as yup from 'yup';

const ResetPasswordFormSchema = yup.object().shape({
  email: emailField
});

export default ResetPasswordFormSchema;