import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import User from '../models/User.js';
import Token from '../models/Token.js';
import {
  BadRequestError,
  UnauthenticatedError,
} from '../errors/customErrors.js';
import {
  createTokenUser,
  attachCookiesToResponse,
  hashString,
} from '../utils/tokenUtils.js';
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from '../utils/sendMail.js';

export const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    throw new BadRequestError('Email already exist');
  }
  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';
  const verificationToken = crypto.randomBytes(40).toString('hex');
  const user = await User.create({
    email,
    name,
    password,
    role,
    verificationToken,
  });
  // send verification token back only while testing in postman
  const origin = 'http://localhost:3000';
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });
  res.status(StatusCodes.CREATED).json({
    msg: 'Success!! Please check your email to verify account',
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  if (!user.isVerified) {
    throw new UnauthenticatedError('Please verify your email');
  }
  const tokenUser = createTokenUser(user);
  // create refresh token
  let refreshToken = '';
  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) throw new UnauthenticatedError('Invalid credentials');
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }
  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, userAgent, ip, user: user._id };
  await Token.create(userToken);
  attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};
export const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });
  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

export const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError('Verification failed');
  }
  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError('Verification failed');
  }
  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = '';
  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Email verified' });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please provide valid email');
  }
  const user = await User.findOne({ email });
  if (user) {
    const passwordToken = crypto.randomBytes(40).toString('hex');
    // send email
    const origin = 'http://localhost:3000';
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpireDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = hashString(passwordToken);
    user.passwordTokenExpireDate = passwordTokenExpireDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please check your email for reset password link' });
};
export const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();
    if (
      user.passwordToken === hashString(token) &&
      user.passwordTokenExpireDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpireDate = null;
      await user.save();
    }
  }

  res.send('reset password');
};
