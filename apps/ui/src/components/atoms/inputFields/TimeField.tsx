import React from 'react';
import BaseTextField from './BaseTextField';
import { ITimeFieldProps } from '../../../interfaces/ITimeFieldProps';

const TimeField = React.forwardRef<HTMLInputElement, ITimeFieldProps>(
  ({ onChange, onKeyDown, value, ...rest }, ref) => {
    const formatTime = (input: string): string => {
      // Remove all non-digit characters except dots
      const cleanInput = input.replace(/[^\d.]/g, '');
      
      // Handle empty input
      if (cleanInput === '' || cleanInput === '.') return '';
      
      // Split by dots
      const parts = cleanInput.split('.');
      
      if (parts.length === 1) {
        // Only hours entered
        const hours = parts[0];
        if (hours.length === 1) return `0${hours}`;
        if (hours.length === 2) return `${hours}.00`;
        if (hours.length > 2) return `${hours.slice(0, 2)}.00`;
        return hours;
      } else if (parts.length === 2) {
        // Hours and minutes
        const hours = parts[0];
        const minutes = parts[1];
        
        // Format hours - ensure 2 digits
        let formattedHours = hours;
        if (hours.length === 1) formattedHours = `0${hours}`;
        if (hours.length > 2) formattedHours = hours.slice(0, 2);
        
        // Format minutes - preserve user input up to 2 digits
        let formattedMinutes = minutes;
        if (minutes.length === 1) formattedMinutes = `${minutes}0`;
        if (minutes.length > 2) formattedMinutes = minutes.slice(0, 2);
        
        return `${formattedHours}.${formattedMinutes}`;
      }
      
      return cleanInput;
    };

    const validateTime = (timeStr: string): boolean => {
      if (!timeStr || timeStr === '') return true;
      
      const parts = timeStr.split('.');
      if (parts.length !== 2) return false;
      
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      
      // Check if hours exceed 24
      if (hours > 24) return false;
      
      // Check if hours is 24 but minutes are greater than 0
      if (hours === 24 && minutes > 0) return false;
      
      // Check if minutes are valid (0-59)
      if (minutes < 0 || minutes > 59) return false;
      
      return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Allow any input during typing, no restrictions
      if (onChange) {
        onChange(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Format the time when user leaves the field
      const inputValue = e.target.value;
      if (inputValue && inputValue.includes('.')) {
        const formattedValue = formatTime(inputValue);
        e.target.value = formattedValue;
        
        // Trigger onChange with formatted value
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: formattedValue }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
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
      
      // Allow digits and dot
      if ((e.keyCode >= 48 && e.keyCode <= 57) || // 0-9
          (e.keyCode >= 96 && e.keyCode <= 105) || // numpad 0-9
          e.keyCode === 190) { // dot
        return;
      }
      
      // Prevent other keys
      e.preventDefault();
      
      // Call the original onKeyDown if provided
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <BaseTextField
        type="text"
        inputMode="decimal"
        maxLength={5}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        slotProps={{
          input: {
            inputProps: { 
              maxLength: 5,
              pattern: "[0-9]{2}\\.[0-9]{2}"
            },
          },
        }}
        {...rest}
        ref={ref}
      />
    );
  }
);

TimeField.displayName = 'TimeField';

export default TimeField;
