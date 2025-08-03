import React, { useState } from 'react';
import BaseTextField from './BaseTextField';
import { IBaseTextFieldProps } from '../../../interfaces/IBaseTextFieldProps';

const NumberField: React.FC<IBaseTextFieldProps> = ({...rest}) => {
  const [chars, setChars] = useState<string>('');

  const handleChange = (value: string) => {
    value = value.replace(/[^0-9]/g, '');
    setChars(value);
  };

  return (
    <BaseTextField value={chars} onChange={(e) => handleChange(e.target.value)} {...rest}/>
  );
};

export default NumberField;
