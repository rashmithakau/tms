import React from 'react';
import BaseTextField from './BaseTextField';
import { INumberFieldProps } from 'apps/ui/src/interfaces/INumberFieldProps';

const NumberField = React.forwardRef<HTMLInputElement, INumberFieldProps>(
  ({ onChange, onKeyDown, type = 'int', ...rest }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      let formattedValue = value;

      if (type === 'int') {
        formattedValue = value.replace(/[^0-9]/g, '');
      } else if (type === 'float' || type === 'decimal') {
        formattedValue = value.replace(/[^0-9.]/g, '');
        const parts = formattedValue.split('.');
        if (parts.length > 2) {
          formattedValue = parts[0] + '.' + parts.slice(1).join('');
        }
      }

      e.target.value = formattedValue;

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