import { TimesheetStatus } from '@tms/shared';
import mongoose, { Schema, Document } from "mongoose";

// Validation helpers
const validateHourFormat = (hour: string): boolean => {
  if (!hour) return true; // Allow empty strings
  return /^\d{1,2}(\.\d{1,2})?$/.test(hour) && parseFloat(hour) >= 0 && parseFloat(hour) <= 24;
};

interface ITimesheetItem {
  work: string;
  projectId?: string;       
  hours: string[];          // Array of 7 strings representing hours for each day of week
  descriptions: string[];   // Array of 7 strings representing descriptions for each day
}

interface ITimesheetCategory {
  category: string;      
  items: ITimesheetItem[];
}

export interface ITimesheet extends Document {
  userId: mongoose.Types.ObjectId;          
  weekStartDate: Date;                      // Monday of the week
  weekEndDate: Date;                        // Sunday of the week
  data: ITimesheetCategory[];
  status: TimesheetStatus;
  totalHours: number;                       // Computed total hours for the week
  submittedAt?: Date;                       // When timesheet was submitted
  reviewedAt?: Date;                        // When timesheet was reviewed
  reviewedBy?: mongoose.Types.ObjectId;     // Who reviewed the timesheet
  createdAt: Date;
  updatedAt: Date;
}

const TimesheetItemSchema = new Schema<ITimesheetItem>({
  work: { type: String, required: true, trim: true },
  projectId: { 
    type: String, 
    validate: {
      validator: function(v: string) {
        return !v || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid project ID format'
    }
  },
  hours: {
    type: [String],
    required: true,
    validate: {
      validator: function(hours: string[]) {
        return hours.length === 7 && hours.every(validateHourFormat);
      },
      message: 'Hours must be an array of 7 valid hour strings (0-24 with up to 2 decimal places)'
    },
    default: () => Array(7).fill('00.00')
  },
  descriptions: {
    type: [String],
    required: true,
    validate: {
      validator: function(descriptions: string[]) {
        return descriptions.length === 7;
      },
      message: 'Descriptions must be an array of 7 strings'
    },
    default: () => Array(7).fill('')
  }
});

const TimesheetCategorySchema = new Schema<ITimesheetCategory>({
  category: { 
    type: String, 
    required: true, 
    enum: ['Project', 'Absence'],
    trim: true
  },
  items: [TimesheetItemSchema],
});

const TimesheetSchema = new Schema<ITimesheet>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  status: { 
    type: String, 
    enum: Object.values(TimesheetStatus), 
    default: TimesheetStatus.Draft,
    index: true
  },
  weekStartDate: { 
    type: Date, 
    required: true,
    index: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  data: [TimesheetCategorySchema],
  totalHours: {
    type: Number,
    default: 0,
    min: 0,
    max: 168 // Maximum hours in a week
  },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
}, {
  timestamps: true
});

// Compound indexes for better query performance
TimesheetSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });
TimesheetSchema.index({ status: 1, weekStartDate: 1 });
TimesheetSchema.index({ reviewedBy: 1, status: 1 });

// Pre-save middleware to calculate week end date and total hours
TimesheetSchema.pre('save', function(next) {
  // Always calculate/recalculate week end date (6 days after start date)
  if (this.weekStartDate) {
    const endDate = new Date(this.weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    this.weekEndDate = endDate;
  }
  
  // Calculate total hours
  let total = 0;
  if (this.data) {
    for (const category of this.data) {
      for (const item of category.items) {
        for (const hour of item.hours) {
          total += parseFloat(hour || '0');
        }
      }
    }
  }
  this.totalHours = Math.round(total * 100) / 100; // Round to 2 decimal places
  
  // Set submitted/reviewed timestamps
  if (this.isModified('status')) {
    if (this.status === TimesheetStatus.Pending && !this.submittedAt) {
      this.submittedAt = new Date();
    }
    if ((this.status === TimesheetStatus.Approved || this.status === TimesheetStatus.Rejected) && !this.reviewedAt) {
      this.reviewedAt = new Date();
    }
  }
  
  next();
});

export const Timesheet = mongoose.model<ITimesheet>(
  "Timesheet",
  TimesheetSchema
);

