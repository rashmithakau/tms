import { IBaseTextFieldProps } from './IBaseTextFieldProps';

export interface ITimeFieldProps extends Omit<IBaseTextFieldProps, 'type' | 'inputMode'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

