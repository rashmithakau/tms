import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
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
