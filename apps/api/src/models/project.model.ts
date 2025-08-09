import mongoose from 'mongoose';

export interface ProjectDocument extends mongoose.Document {
  projectName: string;
  billable: boolean;
  timeSheets: boolean;
  isScrumProject: boolean;
}

const projectSchema = new mongoose.Schema<ProjectDocument>(
  {
    projectName: { type: String, required: true },
    billable: { type: Boolean, required: true },
    timeSheets: { type: Boolean, required: true },
    isScrumProject: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

const ProjectModel = mongoose.model<ProjectDocument>('Project', projectSchema);
export default ProjectModel;
