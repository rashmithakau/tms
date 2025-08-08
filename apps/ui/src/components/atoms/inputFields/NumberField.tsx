import React from 'react';
import BaseTextField from './BaseTextField';
import { INumberFieldProps } from 'apps/ui/src/interfaces/INumberFieldProps';

const NumberField = React.forwardRef<HTMLInputElement, INumberFieldProps>(
  ({ ...rest }, ref) => {
    const { maxDigits = 10, ...otherProps } = rest;
    const handleChange = (value: string) => {
      value = value.replace(/[^0-9]/g, '');
    };

    return (
      <BaseTextField
        onChange={(e) => handleChange(e.target.value)}
        type="number"
        slotProps={{
        input: {
        },
      }}
        {...rest}
        ref={ref}
      />
    );
  }
);

export default NumberField;
