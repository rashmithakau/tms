import { CheckboxProps } from '@mui/material';

export interface ICheckboxProps extends CheckboxProps {
  label?: string;
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
}
