import { CONFLICT, INTERNAL_SERVER_ERROR,UNAUTHORIZED } from '../constants/http';
import UserModel from '../models/user.model';
import appAssert from '../utils/appAssert';
import { UserRole } from '@tms/shared';
import { sendEmail } from '../utils/sendEmail';
import {getWelcomeTmsTemplate}  from '../utils/emailTemplates';
import {generateRandomPassword} from '../utils/passwordUtils';
import { APP_ORIGIN } from '../constants/env';

export type CreateUserParams = {
  email: string;
  designation: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  role:UserRole;
  userAgent?: string;
};

export type ChangePasswordParams = {
  userId:string;
  currentPassword:string;
  newPassword:string;
  confirmNewPassword:string;
}

export const createUser = async (data: CreateUserParams) => {
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

  return {
    user: user.omitPassword(),
  };
};

export const changePassword = async (data: ChangePasswordParams) => {
  const user = await UserModel.findById(data.userId);
  appAssert(user, UNAUTHORIZED, 'User not found');

  // Verify current password
  const isValidCurrentPassword = await user.comparePassword(data.currentPassword);
  appAssert(isValidCurrentPassword, UNAUTHORIZED, 'Current password is incorrect');

  // Validate that new password and confirm password match
  appAssert(data.newPassword === data.confirmNewPassword, UNAUTHORIZED, 'New password and confirm password do not match');

  // Validate that new password is different from current password
  appAssert(data.newPassword !== data.currentPassword, UNAUTHORIZED, 'New password must be different from current password');

  // Update password and set isChangedPwd to true
  user.password = data.newPassword;
  user.isChangedPwd = true;
  
  await user.save();

  return {
    user: user.omitPassword(),
    message: 'Password changed successfully',
  };
};
