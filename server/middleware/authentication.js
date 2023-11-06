import { UnauthorizedError, UnauthenticatedError } from '../errors/customErrors.js';
import  { isTokenValid } from '../utils/tokenUtils.js'

export const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new UnauthenticatedError("Authenticated invalid");
  }
  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authenticated invalid");
  }
};

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("UnauthorizeError to access this route");
    }
    next();
  };
};
