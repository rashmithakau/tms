import * as yup from "yup";
import { emailField, passwordField } from "./TextFieldSchema";

const LoginSchema = yup.object().shape({
  email: emailField,
  password: passwordField,
});

export default LoginSchema;
