import React from 'react';
import BaseTextField from '../atoms/inputFields/BaseTextField';

import { ISearchFieldProps } from '../../interfaces/ISearchFieldProps';

const SearchField: React.FC<ISearchFieldProps> = ({
  value,
  onChange,
  placeholder ,
  label,
  fullWidth = true,
  sx,
}) => {
  return (
    <BaseTextField
      fullWidth={fullWidth}
      label={label}
      placeholder={placeholder}
      variant="outlined"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{mt: 2, ...sx}}
    />
  );
};

export default SearchField;