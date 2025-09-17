import React from 'react';

// Popup component interfaces
export interface CreateAccountPopupProps {
  open: boolean;
  onClose: () => void;
}

export interface ProfilePopupProps {
  open: boolean;
  onClose: () => void;
}

export interface ViewProjectTeamProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export interface SelectActivityPopupProps {
  open: boolean;
  onClose: () => void;
  onSave: (activities: any[]) => void;
}

export interface CreateProjectFormData {
  name: string;
  description: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  hourlyRate: number;
  fixedFee: number;
  billingType: string;
}

export interface CreateDeptPopUpProps {
  open: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
}
