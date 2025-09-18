import React from 'react';
import { TimesheetStatus } from '@tms/shared';

export interface TimesheetCellProps {
  hour: string;
  description: string;
  dayStatus: TimesheetStatus;
  isEditing: boolean;
  isEditable: boolean;
  onCellClick: () => void;
  onCellChange: (value: string) => void;
  onCellKeyDown: (e: React.KeyboardEvent) => void;
  onDescriptionClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}