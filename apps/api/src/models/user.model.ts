import mongoose, { Model } from 'mongoose';
import { hashValue, compareValue } from '../utils/auth';
import { UserRole } from '@tms/shared';
import { IUserDocument, IUserModel } from '../interfaces';

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    employee_id: { type: String, unique: true, sparse: true },
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

// Middleware to generate employee_id before saving
userSchema.pre('save', async function (next) {
  // Generate employee_id only for new documents
  if (this.isNew && !this.employee_id) {
    try {
      // Find the last user with an employee_id
      const lastUser = await mongoose.model('User').findOne(
        { employee_id: { $exists: true, $ne: null } },
        { employee_id: 1 }
      ).sort({ employee_id: -1 }).lean() as { employee_id?: string } | null;

      let nextNumber = 1;
      if (lastUser?.employee_id) {
        // Extract the number from the last employee_id (e.g., "EMP/0001" -> 1)
        const match = lastUser.employee_id.match(/EMP\/(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }

      // Format the new employee_id with leading zeros (e.g., EMP/0001, EMP/0002, etc.)
      this.employee_id = `EMP/${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      return next(error as Error);
    }
  }

  next();
});

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
  delete user.__v;
  return user;
};

userSchema.statics.findAllByRole = async function (role: UserRole): Promise<IUserDocument[]> {
  return this.find({ role, status: true }).sort({ firstName: 1 }).select('-password');
};

userSchema.statics.findAllByRoles = async function (roles: UserRole[]): Promise<IUserDocument[]> {
  return this.find({ role: { $in: roles }, status: true }).sort({ firstName: 1 }).select('-password');
};

userSchema.statics.findAllActive = async function (): Promise<IUserDocument[]> {
  return this.find({ status: true }).sort({ firstName: 1 }).select('-password');
};

userSchema.statics.findAllIncludingInactive = async function (roles: UserRole[]): Promise<IUserDocument[]> {
  return this.find({ role: { $in: roles } }).sort({ firstName: 1 }).select('-password');
};

const UserModel = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default UserModel;