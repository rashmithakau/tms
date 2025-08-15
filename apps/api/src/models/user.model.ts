import mongoose, { Model } from 'mongoose';
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
  status?:boolean;
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

interface UserModel extends Model<UserDocument> {
  findAllByRole(role: UserRole): Promise<UserDocument[]>;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    designation: { type: String, required: true },
    contactNumber: { type: String, required: true },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    status: { type: Boolean, default: true }, 
    isChangedPwd: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.findAllByRole = function (role: UserRole) {
  return this.find({ role });
};

// Middleware to hash the password before saving
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

const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

export default User;