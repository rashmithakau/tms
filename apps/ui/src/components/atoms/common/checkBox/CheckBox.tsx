import { Checkbox, FormControlLabel } from '@mui/material';
import React from 'react';
import { ICheckboxProps } from '../../../../interfaces/component';

const CheckBox: React.FC<ICheckboxProps> = ({
  label,
  labelPlacement = 'end',
  ...props
}) => {
  if (label) {
    return (
      <FormControlLabel
        control={<Checkbox {...props} />}
        label={label}
        labelPlacement={labelPlacement}
        // reduce the label font size
        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
              // label should be a bit up when placement is start or top
              ...(labelPlacement === 'start' || labelPlacement === 'top' ? { alignItems: 'flex-start' } : {})
      }}
      />
    );
  }

  return <Checkbox {...props} />;
};

export default CheckBox;
