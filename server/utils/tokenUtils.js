import { UnauthorizedError } from '../errors/customErrors.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

export const isTokenValid = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

export const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    maxAge: 1000,
  });
  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });
};

export const createTokenUser = (user) => {
  return { name: user.name, userId: user._id, role: user.role };
};

export const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === 'admin') return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new UnauthorizedError('Not authorized to access this route');
};

// export const attachSingleCookieToResponse = ({ res, user }) => {
//   const token = createJWT({ payload: user });
//   const oneDay = 1000 * 60 * 60 * 24;
//   res.cookie("token", token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === "production",
//     signed: true,
//   });
// };

export const hashString = (string) =>
  crypto.createHash('md5').update(string).digest('hex');
