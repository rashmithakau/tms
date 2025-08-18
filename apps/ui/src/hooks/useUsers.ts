import { useState, useEffect, useCallback } from 'react';
import { getUsers } from '../api/user';
import { UserRole } from '@tms/shared';

interface User {
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

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  clearError: () => void;
}

export const useUsers = (role: UserRole): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getUsers(role);
      if (response && response.data.users) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users';
      console.error('Error fetching users:', err);
      setError(errorMessage);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refreshUsers,
    clearError,
  };
};

