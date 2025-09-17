import { UserRole } from '@tms/shared';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  status: string;
  contactNumber: string;
  role: UserRole;
  createdAt?: string;
}

export interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  clearError: () => void;
}
