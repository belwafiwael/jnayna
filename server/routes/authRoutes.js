import { Router } from 'express';
import {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authentication.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.delete('/logout', authenticateUser, logout);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
