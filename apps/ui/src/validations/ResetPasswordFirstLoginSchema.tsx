import * as yup from 'yup';
import { passwordField, confirmPasswordField ,NewpasswordField} from './TextFieldSchema';

const ResetPasswordFirstLoginSchema = yup.object().shape({
  newPassword: NewpasswordField,
  confirmPassword: confirmPasswordField('newPassword'),
});

export default ResetPasswordFirstLoginSchema;
