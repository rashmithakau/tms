import mongoose from 'mongoose';
import UserModel from '../models/user.model';
import { UserRole } from '@tms/shared';
import { MONGO_URI } from '../constants/env';

/**
 * Script to create a SuperAdmin user
 * Usage: npx ts-node apps/api/src/scripts/createSuperAdmin.ts
 */

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if SuperAdmin already exists
    const existingSuperAdmin = await UserModel.findOne({ 
      role: UserRole.SuperAdmin 
    });

    if (existingSuperAdmin) {
      console.log('SuperAdmin already exists:');
      console.log(`Email: ${existingSuperAdmin.email}`);
      console.log(`Name: ${existingSuperAdmin.firstName} ${existingSuperAdmin.lastName}`);
      
      // Optionally update the existing SuperAdmin
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Do you want to update the password? (yes/no): ', async (answer: string) => {
        if (answer.toLowerCase() === 'yes') {
          readline.question('Enter new password: ', async (newPassword: string) => {
            existingSuperAdmin.password = newPassword;
            existingSuperAdmin.status = true;
            await existingSuperAdmin.save();
            console.log('SuperAdmin password updated successfully!');
            await mongoose.disconnect();
            process.exit(0);
          });
        } else {
          console.log('No changes made.');
          await mongoose.disconnect();
          process.exit(0);
        }
      });
      return;
    }

    // Create new SuperAdmin
    const superAdmin = await UserModel.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@tms.com',
      password: 'SuperAdmin@123', // Change this to a secure password
      role: UserRole.SuperAdmin,
      designation: 'Super Administrator',
      contactNumber: '+1234567890',
      status: true,
      isVerified: true,
      isChangedPwd: false,
      // Note: employee_id is not set for SuperAdmin
    });

    console.log('SuperAdmin created successfully!');
    console.log('Email:', superAdmin.email);
    console.log('Password: SuperAdmin@123');
    console.log('Please change the password after first login.');

  } catch (error) {
    console.error('Error creating SuperAdmin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

createSuperAdmin();
