import { TextField } from '@mui/material';
import React from 'react';
import { IBaseTextFieldProps } from '../../../interfaces/IBaseTextFieldProps';

// Forward refs to make it compatible with react-hook-form
const BaseTextField = React.forwardRef<HTMLDivElement, IBaseTextFieldProps>(({
  variant = 'outlined',
  maxLength = 255,
  ...rest
}, ref) => {
  return (
    <TextField
      ref={ref} // Forward the ref to TextField
      variant={variant}
      fullWidth
      size="medium"
      slotProps={{
        input: {
          inputProps: { maxLength }, 
        },
      }}
      {...rest}
    />
  );
});


export default BaseTextField;