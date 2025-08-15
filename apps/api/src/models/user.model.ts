import mongoose from 'mongoose';
import { hashValue } from '../utils/bcrypt';
import { compareValue } from '../utils/bcrypt';
import { UserRole } from '@tms/shared';

export interface UserDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  designation: string;
  contactNumber: string;
  teams: ['ObjectId'];
  email: string;
  password: string;
  role: string;
  isChangedPwd: boolean;
  isVerified?: boolean; // Optional field for email verification
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    UserDocument,
    | 'firstName'
    | 'lastName'
    | 'designation'
    | 'contactNumber'
    | 'email'
    | 'role'
    | 'isChangedPwd'
    | 'isVerified'
    | 'createdAt'
    | 'updatedAt'
    | '__v'
  >;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    designation: { type: String, required: true },
    contactNumber: { type: String, required: true },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }], // Reference to Team collection
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: UserRole },
    isChangedPwd: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>('User', userSchema);
export default UserModel;
