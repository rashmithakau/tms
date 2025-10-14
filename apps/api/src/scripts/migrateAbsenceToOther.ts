import mongoose from 'mongoose';
import { Timesheet } from '../models/timesheet.model';
import connectDB from '../config/db';

/**
 * Migration script to update all timesheets:
 * - Change category from "Absence" to "Other"
 * 
 * Usage: npx ts-node apps/api/src/scripts/migrateAbsenceToOther.ts
 */

async function migrateAbsenceToOther() {
  try {
    console.log('🔄 Starting migration: Absence -> Other');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Find all timesheets with Absence category
    const timesheets = await Timesheet.find({
      'data.category': 'Absence'
    });

    console.log(`📊 Found ${timesheets.length} timesheets with "Absence" category`);

    let updatedCount = 0;

    // Update each timesheet
    for (const timesheet of timesheets) {
      let modified = false;
      
      // Update categories
      for (const category of timesheet.data) {
        if (category.category === 'Absence') {
          category.category = 'Other';
          modified = true;
        }
      }

      if (modified) {
        await timesheet.save();
        updatedCount++;
        console.log(`✅ Updated timesheet ${timesheet._id}`);
      }
    }

    console.log(`\n✨ Migration completed successfully!`);
    console.log(`📈 Updated ${updatedCount} timesheets`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateAbsenceToOther();
