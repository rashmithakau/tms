import * as yup from 'yup';
import { confirmPasswordField ,NewpasswordField} from './TextFieldSchema';

const PasswordResetChangePasswordPageSchema = yup.object().shape({
  newPassword: NewpasswordField,
  confirmPassword: confirmPasswordField('newPassword'),
});

export default PasswordResetChangePasswordPageSchema;
