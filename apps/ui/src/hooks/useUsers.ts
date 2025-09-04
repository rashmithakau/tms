import { useState, useEffect, useCallback, useMemo } from 'react';
import { getUsers, getAllActiveUsers, getAllUsersIncludingInactive } from '../api/user';
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

//fetch users across multiple roles and merge them
export const useUsersByRoles = (roles: UserRole[]): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rolesKey = useMemo(() => (Array.isArray(roles) ? [...roles].sort().join(',') : ''), [roles]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const responses = await Promise.all((roles || []).map((r) => getUsers(r)));
      const merged: Record<string, User> = {};
      responses.forEach((resp) => {
        const arr = resp?.data?.users as User[] | undefined;
        (arr ?? []).forEach((u) => {
          merged[(u as any)._id as string] = u;
        });
      });
      setUsers(Object.values(merged));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users';
      console.error('Error fetching users:', err);
      setError(errorMessage);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [rolesKey]);

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

//fetch all active users regardless of role
export const useAllActiveUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getAllActiveUsers();
      if (response && response.data.users) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch active users';
      console.error('Error fetching active users:', err);
      setError(errorMessage);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

// fetch all users including inactive ones for EmpTable
export const useAllUsersIncludingInactive = (roles: UserRole[]): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rolesKey = useMemo(() => (Array.isArray(roles) ? [...roles].sort().join(',') : ''), [roles]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getAllUsersIncludingInactive(roles);
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
  }, [rolesKey]);

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

