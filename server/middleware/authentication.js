import {
  UnauthorizedError,
  UnauthenticatedError,
} from '../errors/customErrors.js';
import Token from '../models/Token.js';
import { attachCookiesToResponse, isTokenValid } from '../utils/tokenUtils.js';

export const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;
  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }
    const payload = isTokenValid(refreshToken);
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });
    if (!existingToken || !existingToken?.isValid) {
      throw new UnauthenticatedError('Authenticated invalid');
    }
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authenticated invalid');
  }
};

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('UnauthorizeError to access this route');
    }
    next();
  };
};
