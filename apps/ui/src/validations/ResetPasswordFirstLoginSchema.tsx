import * as yup from 'yup';
import { passwordField, confirmPasswordField ,NewpasswordField} from './TextFieldSchema';

const ResetPasswordFirstLoginSchema = yup.object().shape({
  currentPassword: passwordField,
  newPassword: NewpasswordField,
  confirmPassword: confirmPasswordField('newPassword'),
});

export default ResetPasswordFirstLoginSchema;
