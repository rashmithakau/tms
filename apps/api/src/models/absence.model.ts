import mongoose, { Model } from 'mongoose';
import { TimesheetStatus,absenceActivity} from '@tms/shared';


export interface AbsenceDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  absenceActivity: absenceActivity;
  hoursSpent: number;
  status: TimesheetStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface AbsenceModel extends Model<AbsenceDocument> {
}

const abseneSchema = new mongoose.Schema<AbsenceDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    absenceActivity: { type: String, required: true ,enum: Object.values(absenceActivity)},
    hoursSpent: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(TimesheetStatus), default: TimesheetStatus.Draft },
  },
  {
    timestamps: true,
  }
);


const Absence = mongoose.model<AbsenceDocument, AbsenceModel>('Absence', abseneSchema);

export default Absence;



