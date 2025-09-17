import * as yup from 'yup';
import { confirmPasswordField ,NewpasswordField} from '../other/TextFieldSchema';

const ResetPasswordFirstLoginSchema = yup.object().shape({
  newPassword: NewpasswordField,
  confirmPassword: confirmPasswordField('newPassword'),
});

export default ResetPasswordFirstLoginSchema;
