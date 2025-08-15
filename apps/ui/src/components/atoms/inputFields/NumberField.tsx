import React from 'react';
import BaseTextField from './BaseTextField';
import { INumberFieldProps } from 'apps/ui/src/interfaces/INumberFieldProps';

const NumberField = React.forwardRef<HTMLInputElement, INumberFieldProps>(
  ({ onChange, onKeyDown, ...rest }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Remove any non-digit characters
      const digitsOnly = value.replace(/[^0-9]/g, '');
      
      // Limit to 10 digits
      const limitedValue = digitsOnly.slice(0, 10);
      
      // Update the input value
      e.target.value = limitedValue;
      
      // Call the original onChange if provided
      if (onChange) {
        onChange(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, and navigation keys
      if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode) ||
          // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true)) {
        return;
      }
      
      // Ensure that it is a number and stop the keypress if not
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
      
      // Call the original onKeyDown if provided
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <BaseTextField
        type="text"
        inputMode="numeric"
        maxLength={10}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        slotProps={{
          input: {
            inputProps: { 
              maxLength: 10,
              pattern: "[0-9]*"
            },
          },
        }}
        {...rest}
        ref={ref}
      />
    );
  }
);

NumberField.displayName = 'NumberField';

export default NumberField;
