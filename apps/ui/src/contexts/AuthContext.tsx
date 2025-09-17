import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@tms/shared';
import { getCurrentUser, logout as logoutAPI } from '../api/auth';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  designation: string;
  contactNumber?: string;
  isChangedPwd: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useIsAuthenticated = () => {
  const { authState } = useAuth();
  return !!authState.user;
};


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false, 
  });

  const login = (user: User) => {
    try {
      console.log('AuthContext: Login called with user:', user);
      
      setAuthState({
        user,
        isLoading: false,
      });
      
      console.log('AuthContext: State updated, user authenticated:', true, 'role:', user.role);
      
    } catch (error) {
      console.error('AuthContext: Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      await logoutAPI();
      
      setAuthState({
        user: null,
        isLoading: false,
      });
      
    } catch (error) {
      console.error('AuthContext: Error during logout:', error);
      setAuthState({
        user: null,
        isLoading: false,
      });
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  const checkAuth = async () => {
    setAuthState(prev => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const response = await getCurrentUser();
      const user = response.data.user;
      
      setAuthState({
        user,
        isLoading: false,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
      });
      throw error; 
    }
  };

  const value: AuthContextType = {
    authState,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
