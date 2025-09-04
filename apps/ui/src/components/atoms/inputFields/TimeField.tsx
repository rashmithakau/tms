// import React from 'react';
// import BaseTextField from './BaseTextField';
// import { ITimeFieldProps } from '../../../interfaces/ITimeFieldProps';

// const TimeField = React.forwardRef<HTMLInputElement, ITimeFieldProps>(
//   ({ onChange, onKeyDown, value, ...rest }, ref) => {
//     const formatTime = (input: string): string => {

//       const cleanInput = input.replace(/[^\d.]/g, '');
      
//       if (cleanInput === '' || cleanInput === '.') return '';
      
//       const parts = cleanInput.split('.');
      
//       if (parts.length === 1) {
//         const hours = parts[0];
//         if (hours.length === 1) return `0${hours}`;
//         if (hours.length === 2) return `${hours}.00`;
//         if (hours.length > 2) return `${hours.slice(0, 2)}.00`;
//         return hours;
//       } else if (parts.length === 2) {
//         const hours = parts[0];
//         const minutes = parts[1];
        
//         let formattedHours = hours;
//         if (hours.length === 1) formattedHours = `0${hours}`;
//         if (hours.length > 2) formattedHours = hours.slice(0, 2);
        
//         let formattedMinutes = minutes;
//         if (minutes.length === 1) formattedMinutes = `${minutes}0`;
//         if (minutes.length > 2) formattedMinutes = minutes.slice(0, 2);
        
//         return `${formattedHours}.${formattedMinutes}`;
//       }
      
//       return cleanInput;
//     };



//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       if (onChange) {
//         onChange(e);
//       }
//     };

//     const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
//       const inputValue = e.target.value;
//       if (inputValue && inputValue.includes('.')) {
//         const formattedValue = formatTime(inputValue);
//         e.target.value = formattedValue;
        
//         if (onChange) {
//           const syntheticEvent = {
//             ...e,
//             target: { ...e.target, value: formattedValue }
//           } as React.ChangeEvent<HTMLInputElement>;
//           onChange(syntheticEvent);
//         }
//       }
//     };

//     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//       if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode) ||
//           (e.keyCode === 65 && e.ctrlKey === true) ||
//           (e.keyCode === 67 && e.ctrlKey === true) ||
//           (e.keyCode === 86 && e.ctrlKey === true) ||
//           (e.keyCode === 88 && e.ctrlKey === true)) {
//         return;
//       }
      
//       if ((e.keyCode >= 48 && e.keyCode <= 57) || // 0-9
//           (e.keyCode >= 96 && e.keyCode <= 105) || // numpad 0-9
//           e.keyCode === 190) { // dot
//         return;
//       }

//       e.preventDefault();

//       if (onKeyDown) {
//         onKeyDown(e);
//       }
//     };

//     return (
//       <BaseTextField
//         type="text"
//         inputMode="decimal"
//         maxLength={5}
//         onChange={handleChange}
//         onBlur={handleBlur}
//         onKeyDown={handleKeyDown}
//         slotProps={{
//           input: {
//             inputProps: { 
//               maxLength: 5,
//               pattern: "[0-9]{2}\\.[0-9]{2}"
//             },
//           },
//         }}
//         {...rest}
//         ref={ref}
//       />
//     );
//   }
// );

// TimeField.displayName = 'TimeField';

// export default TimeField;
