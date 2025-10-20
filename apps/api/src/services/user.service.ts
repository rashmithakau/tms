import { CONFLICT, INTERNAL_SERVER_ERROR,UNAUTHORIZED,NOT_FOUND } from '../constants/http';
import UserModel from '../models/user.model';
import { appAssert } from '../utils/validation';
import { UserRole } from '@tms/shared';
import { sendEmail, getWelcomeTmsTemplate } from '../utils/email';
import { generateRandomPassword } from '../utils/auth';
import { APP_ORIGIN } from '../constants/env';
import { CreateUserParams, ChangePasswordParams } from '../interfaces/user';
import { HistoryService } from './history.service';

export const createUser = async (data: CreateUserParams, performedBy?: string) => {
  const existingUser = await UserModel.exists({
    email: data.email,
  });

  appAssert(!existingUser, CONFLICT, 'Email already exists');

  const genertatedPassword =generateRandomPassword();

  const user = await UserModel.create({
    email: data.email,
    password:genertatedPassword,
    designation: data.designation,
    firstName: data.firstName,
    lastName: data.lastName,
    contactNumber: data.contactNumber,
    role: data.role,
    userAgent: data.userAgent,
  });

  appAssert(user, INTERNAL_SERVER_ERROR, 'User creation failed');

  sendEmail({
    to: user.email,
    ...getWelcomeTmsTemplate(APP_ORIGIN,user.email,genertatedPassword),
  });

  // Log history
  if (performedBy) {
    await HistoryService.logUserCreated(
      performedBy,
      {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      }
    );
  }

  return {
    user: user.omitPassword(),
  };
};

export const changePassword = async (data: ChangePasswordParams) => {
  const user = await UserModel.findById(data.userId);
  appAssert(user, UNAUTHORIZED, 'User not found');

  // Update password and set isChangedPwd to true
  user.password = data.newPassword;
  user.isChangedPwd = true;
  
  await user.save();

  return {
    user: user.omitPassword(),
    message: 'Password changed successfully',
  };
};

//getUsersByRole
export const getUsersByRole = async (role: UserRole| UserRole[]) => {
  const roles = Array.isArray(role) ? role : [role];
  const data = await UserModel.findAllByRoles(roles);
  const users = data.map(user => user.omitPassword());
  return {
    users,
  };
};

export const deleteUser = async (id: string, performedBy?: string) => {
  const user = await UserModel.findById(id);
  appAssert(user, NOT_FOUND, 'User not found');

  user.status = false;
  await user.save();

  // Log history
  if (performedBy) {
    await HistoryService.logUserDeactivated(
      performedBy,
      {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
      }
    );
  }

  return {
    user: user.omitPassword(),
    message: 'User status set to inactive',
  };
};

//for components that need to show available users
export const getAllActiveUsers = async () => {
  const data = await UserModel.findAllActive();
  const users = data.map((user) => user.omitPassword());
  return {
    users,
  };
};

//for EmpTable to show all users including inactive ones
export const getAllUsersIncludingInactive = async (roles: UserRole[]) => {
  const data = await UserModel.findAllIncludingInactive(roles);
  const users = data.map((user) => user.omitPassword());
  return {
    users,
  };
};

export const updateUserById = async (
  id: string,
  updates: Partial<{ designation: string; contactNumber: string; status: boolean }>,
  performedBy?: string
) => {
  const user = await UserModel.findById(id);
  appAssert(user, NOT_FOUND, 'User not found');

  const oldStatus = user.status;
  const changes: string[] = [];

  if (typeof updates.designation !== 'undefined') {
    user.designation = updates.designation as string;
    changes.push('designation');
  }
  if (typeof updates.contactNumber !== 'undefined') {
    user.contactNumber = updates.contactNumber as string;
    changes.push('contact number');
  }
  if (typeof updates.status !== 'undefined') {
    user.status = updates.status as boolean;
  }

  await user.save();

  // Log history
  if (performedBy) {
    const userName = `${user.firstName} ${user.lastName}`;
    const userId = user._id.toString();

    // Check if user was reactivated
    if (oldStatus === false && updates.status === true) {
      await HistoryService.logUserReactivated(performedBy, {
        id: userId,
        name: userName,
      });
    }
    // Check if user was deactivated
    else if (oldStatus === true && updates.status === false) {
      await HistoryService.logUserDeactivated(performedBy, {
        id: userId,
        name: userName,
      });
    }
    // Log other profile updates
    else if (changes.length > 0) {
      await HistoryService.logUserUpdated(
        performedBy,
        { id: userId, name: userName },
        changes.join(', ')
      );
    }
  }

  return {
    user: user.omitPassword(),
    message: 'User updated successfully',
  };
};