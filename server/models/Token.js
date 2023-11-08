import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
const TokenSchema = new mongoose.Schema(
  {
    refreshToken: { type: String, require: true },
    ip: { type: String, require: true },
    userAgent: { type: String, require: true },
    isValid: { type: Boolean, default: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', require: true },
  },
  { timestamps: true },
);

export default mongoose.model('Token', TokenSchema);
