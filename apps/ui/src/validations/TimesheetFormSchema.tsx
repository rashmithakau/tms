import * as yup from 'yup';
import { ITimesheetFormValues } from '../interfaces/ITimesheetFormValues';

export const timesheetFormSchema: yup.ObjectSchema<ITimesheetFormValues> = yup.object({
  date: yup.string().required('Date is required'),
  projectName: yup.string().required('Project is required'),
  taskTitle: yup.string().required('Task is required'),
  description: yup.string().optional(),
  plannedHours: yup.string()
    .matches(/^\d{1,2}\.\d{1,2}$/, 'Time must be in H.MM or HH.MM format (e.g., 8.30 or 08.30)')
    .test('valid-time', 'Time must be between 00.00 and 24.00', (value) => {
      if (!value) return true; // Allow empty
      const [hours, minutes] = value.split('.');
      const hoursNum = parseInt(hours, 10);
      const minutesNum = parseInt(minutes, 10);
      
      // Check if hours exceed 24
      if (hoursNum > 24) return false;
      
      // Check if hours is 24 but minutes are greater than 0
      if (hoursNum === 24 && minutesNum > 0) return false;
      
      // Check if minutes are valid (0-59)
      if (minutesNum < 0 || minutesNum > 59) return false;
      
      return true;
    })
    .optional(),
  hoursSpent: yup.string()
    .matches(/^\d{1,2}\.\d{1,2}$/, 'Time must be in H.MM or HH.MM format (e.g., 8.30 or 08.30)')
    .test('valid-time', 'Time must be between 00.00 and 24.00', (value) => {
      if (!value) return true; // Allow empty
      const [hours, minutes] = value.split('.');
      const hoursNum = parseInt(hours, 10);
      const minutesNum = parseInt(minutes, 10);
      
      // Check if hours exceed 24
      if (hoursNum > 24) return false;
      
      // Check if hours is 24 but minutes are greater than 0
      if (hoursNum === 24 && minutesNum > 0) return false;
      
      // Check if minutes are valid (0-59)
      if (minutesNum < 0 || minutesNum > 59) return false;
      
      return true;
    })
    .optional(),
  billableType: yup
    .mixed<'Billable' | 'Non Billable'>()
    .oneOf(['Billable', 'Non Billable'], 'Please select a valid billable type')
    .required('Billable type is required'),
});
