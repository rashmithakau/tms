import { IBaseTextFieldProps } from "./IBaseTextFieldProps";

export interface INumberFieldProps extends IBaseTextFieldProps {
  maxDigits?: number;
}