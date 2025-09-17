import React from 'react';
import { TimesheetStatus } from '@tms/shared';
import { UserRole } from '@tms/shared';
import { IAddEmployeePopupProps } from '../form/IAddEmployeePopupProps';

// Table component interfaces
export interface EmpTimesheetRow {
  _id: string;
  date: string;
  projectId: string;
  projectName: string; // populated from project reference
  tasks: string;
  billableType: 'Billable' | 'Non Billable';
  status: TimesheetStatus;
  plannedHours?: number;
  hoursSpent?: number;
  description?: string;
}

// Team/User component interfaces
export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  designation?: string;
}

// Enhanced popup props
export interface AddEmployeePopupPropsWithRoles extends IAddEmployeePopupProps {
  roles?: UserRole[];
}

// Landing page props
export interface SectionContainerProps extends React.PropsWithChildren {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  component?: React.ElementType<any>;
}
