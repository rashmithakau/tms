import { UserRole } from '@tms/shared';

export interface IUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    designation: string;
    role: UserRole;
    contactNumber?: string;
    isChangedPwd: boolean;
}
