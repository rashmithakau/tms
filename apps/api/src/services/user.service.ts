import { CONFLICT, INTERNAL_SERVER_ERROR,UNAUTHORIZED } from '../constants/http';
import UserModel from '../models/user.model';
import appAssert from '../utils/appAssert';
import { UserRole } from '@tms/shared';
import { sendEmail } from '../utils/sendEmail';
import {getWelcomeTmsTemplate}  from '../utils/emailTemplates';
import {generateRandomPassword} from '../utils/passwordUtils';
import { APP_ORIGIN } from '../constants/env';
import VerificationCodeModel from '../models/verificationCode.model';
import VerificationCodeType from '../constants/verificationCodeType';
import { oneYearFromNow } from '../utils/date';

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
  newPassword:string;
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
export const getUsersByRole = async (role: UserRole) => {
  const data = await UserModel.findAllByRole(role);
  const users = data.map(user => user.omitPassword());
  return {
    users,
  };
};