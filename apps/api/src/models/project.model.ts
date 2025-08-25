import mongoose from 'mongoose';

export interface ProjectDocument extends mongoose.Document {
  projectName: string;
  billable: boolean;
  employees: mongoose.Types.ObjectId[];
  status: boolean;
  supervisor: mongoose.Types.ObjectId;
}

const projectSchema = new mongoose.Schema<ProjectDocument>(
  {
    projectName: { type: String, required: true },
    billable: { type: Boolean, required: true },
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    status: { type: Boolean, default: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
  },
  {
    timestamps: true,
  }
);

const ProjectModel = mongoose.model<ProjectDocument>('Project', projectSchema);
export default ProjectModel;
