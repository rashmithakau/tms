import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@tms/shared';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  designation: string;
  isChangedPwd: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('AuthContext: Initializing auth state from localStorage');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const user = isAuthenticated ? {
          _id: localStorage.getItem('_id') || '',
          firstName: localStorage.getItem('firstName') || '',
          lastName: localStorage.getItem('lastName') || '',
          email: localStorage.getItem('email') || '',
          role: (localStorage.getItem('role') as UserRole) || UserRole.Emp,
          designation: localStorage.getItem('designation') || '',
          isChangedPwd: localStorage.getItem('isChangedPwd') === 'true',
        } : null;

        console.log('AuthContext: Initial state:', { isAuthenticated, user });
        setAuthState({
          isAuthenticated,
          user,
          isLoading: false,
        });
      } catch (error) {
        console.error('AuthContext: Error initializing auth state:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = (user: User) => {
    try {
      console.log('AuthContext: Login called with user:', user);
      
      // Set localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('_id', user._id);
      localStorage.setItem('firstName', user.firstName);
      localStorage.setItem('lastName', user.lastName);
      localStorage.setItem('email', user.email);
      localStorage.setItem('role', user.role);
      localStorage.setItem('designation', user.designation);
      localStorage.setItem('isChangedPwd', user.isChangedPwd.toString());

      // Update state
      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
      
      console.log('AuthContext: Login completed, new state:', { isAuthenticated: true, user });
    } catch (error) {
      console.error('AuthContext: Error during login:', error);
    }
  };

  const logout = () => {
    try {
      console.log('AuthContext: Logout called');
      
      // Clear localStorage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('_id');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('designation');
      localStorage.removeItem('isChangedPwd');

      // Update state
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      
      console.log('AuthContext: Logout completed, new state:', { isAuthenticated: false, user: null });
    } catch (error) {
      console.error('AuthContext: Error during logout:', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      console.log('AuthContext: Updating user with:', updates);
      
      const updatedUser = { ...authState.user, ...updates };
      
      // Update localStorage for changed fields
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          localStorage.setItem(key, value.toString());
        }
      });

      // Update state
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      
      console.log('AuthContext: User updated, new user:', updatedUser);
    }
  };

  const value: AuthContextType = {
    authState,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
