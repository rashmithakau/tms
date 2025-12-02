import React from 'react';
import { TimesheetStatus } from '@tms/shared';
import { UserRole } from '@tms/shared';
import { IAddEmployeePopupProps } from '../form/IAddEmployeePopupProps';


export interface EmpTimesheetRow {
  _id: string;
  date: string;
  projectId: string;
  projectName: string; 
  tasks: string;
  billableType: 'Billable' | 'Non Billable';
  status: TimesheetStatus;
  plannedHours?: number;
  hoursSpent?: number;
  description?: string;
}


export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  designation?: string;
}


export interface AddEmployeePopupPropsWithRoles extends IAddEmployeePopupProps {
  roles?: UserRole[];
}


export interface SectionContainerProps extends React.PropsWithChildren {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  component?: React.ElementType<any>;
}
