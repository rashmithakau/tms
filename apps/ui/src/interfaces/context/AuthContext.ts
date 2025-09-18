import { ReactNode } from 'react';
import { IUser } from '../entity';

export interface AuthState {
  user: IUser | null;
  isLoading: boolean;
}

export interface AuthContextType {
  authState: AuthState;
  login: (user: IUser) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<IUser>) => void;
  checkAuth: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}