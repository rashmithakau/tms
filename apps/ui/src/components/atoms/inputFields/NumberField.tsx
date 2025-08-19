import React from 'react';
import BaseTextField from './BaseTextField';
import { INumberFieldProps } from 'apps/ui/src/interfaces/INumberFieldProps';

const NumberField = React.forwardRef<HTMLInputElement, INumberFieldProps>(
  ({ onChange, onKeyDown, type = 'int', ...rest }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      let formattedValue = value;

      if (type === 'int') {
        // Allow only digits
        formattedValue = value.replace(/[^0-9]/g, '');
      } else if (type === 'float' || type === 'decimal') {
        // Allow digits and a single decimal point
        formattedValue = value.replace(/[^0-9.]/g, '');
        const parts = formattedValue.split('.');
        if (parts.length > 2) {
          // If more than one decimal point, keep only the first one
          formattedValue = parts[0] + '.' + parts.slice(1).join('');
        }
      }

      // Update the input value
      e.target.value = formattedValue;

      // Call the original onChange if provided
      if (onChange) {
        onChange(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <BaseTextField
        {...rest}
        ref={ref}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    );
  }
);

export default NumberField;