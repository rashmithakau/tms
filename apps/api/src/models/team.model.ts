import mongoose from 'mongoose';

export interface TeamDocument extends mongoose.Document {
  teamName: string;
  members: mongoose.Types.ObjectId[];
  supervisor?: mongoose.Types.ObjectId | null;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new mongoose.Schema<TeamDocument>(
  {
    teamName: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const TeamModel = mongoose.model<TeamDocument>('Team', teamSchema);
export default TeamModel;



