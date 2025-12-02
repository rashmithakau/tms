import { IUser } from "../entity";

export interface UserState {
    loading: boolean;
    user: IUser|null;
    error: string;
    isAuthenticated: boolean;
  }