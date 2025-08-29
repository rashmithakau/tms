import React from 'react';
import { InputBase } from '@mui/material';

export interface HourInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const HourInput: React.FC<HourInputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyDown,
  disabled = false,
  placeholder = "00.00",
  autoFocus = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Validate format: up to 2 digits, optional decimal point, up to 2 decimal places
    if (newValue && !/^\d{0,2}(\.\d{0,2})?$/.test(newValue)) return;
    onChange(newValue);
  };

  return (
    <InputBase
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      disabled={disabled}
      autoFocus={autoFocus}
      placeholder={placeholder}
      sx={{
        width: 50,
        height: 28,
        borderRadius: 1,
        textAlign: 'center',
        fontSize: '14px',
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        '&:hover': {
          borderColor: '#b0b0b0',
        },
        '&.Mui-focused': {
          borderColor: '#1976d2',
          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
        },
        '& input': {
          textAlign: 'center',
          padding: '4px 8px',
        },
      }}
    />
  );
};

export default HourInput;