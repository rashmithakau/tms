import { IUser } from "./IUser";

export interface UserState {
    loading: boolean;
    user: IUser|null;
    error: string;
  }