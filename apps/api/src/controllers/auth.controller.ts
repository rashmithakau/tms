import catchErrors from '../utils/catchErrors';
import { refreshUserAccessToken } from '../services/auth.service';
import { OK } from '../constants/http';
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from '../utils/cookies';
import { loginSchema, changePasswordSchema } from './../schemas/auth.schema';
import { loginUser } from '../services/auth.service';
import { verifyToken } from '../utils/jwt';
import SessionModel from '../models/session.model';
import { clearAuthCookies } from '../utils/cookies';
import appAssert from '../utils/appAssert';
import { UNAUTHORIZED } from '../constants/http';
import { changePassword } from '../services/user.service';

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers['user-agent'],
  });
  const { accessToken, refreshToken, user, isChangedPwd } = await loginUser(
    request
  );

  return setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
    message: 'Login successful',
    user,
    isChangedPwd,
  });
});

export const logoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  const { payload } = verifyToken(accessToken || '');

  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionId);
  }

  return clearAuthCookies(res).status(OK).json({
    message: 'Logout successful',
  });
});

export const refreshHandler = catchErrors(async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, 'Missing refresh token');

  const { accessToken, newRefreshToken } = await refreshUserAccessToken(
    refreshToken
  );

  if (newRefreshToken) {
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
    .json({
      message: 'Access token refreshed',
    });
});

export const changePasswordHandler = catchErrors(async (req, res) => {
  const request = changePasswordSchema.parse(req.body);
  console.log('Change password request:', request);

  // Get user ID from the authenticated request (set by authenticate middleware)
  const userId = req.userId as string;
  appAssert(userId, UNAUTHORIZED, 'User not authenticated');

  const result = await changePassword({
    userId,
    currentPassword: request.currentPassword,
    newPassword: request.newPassword,
  });

  return res.status(OK).json({
    message: result.message,
    user: result.user,
  });
});
