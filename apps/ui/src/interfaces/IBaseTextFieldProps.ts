import { TextFieldProps } from '@mui/material/TextField';

export interface IBaseTextFieldProps extends Omit<TextFieldProps, 'inputProps'> {
    maxLength?: number;
  }