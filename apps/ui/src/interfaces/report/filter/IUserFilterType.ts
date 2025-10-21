export type UserFilterType = 'individual' | 'team' | 'project';

export interface UserFilterConfig {
  type: UserFilterType;
  individualIds?: string[];
  teamIds?: string[];
  projectIds?: string[];
}

export interface UserFilterTypeSelectorProps {
  filterType: UserFilterType;
  onChange: (type: UserFilterType) => void;
  disabled?: boolean;
  availableOptions?: UserFilterType[];
}

export interface UseUserFilterTypeOptions {
  userRole: string;
  canSeeAllData: boolean;
}