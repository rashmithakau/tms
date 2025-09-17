import mongoose, { Document } from 'mongoose';

export interface IProject extends Document {
  projectName: string;
  billable: boolean;
  employees: mongoose.Types.ObjectId[];
  status: boolean;
  supervisor?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends mongoose.Document, IProject {}

export interface ICreateProjectParams {
  projectName: string;
  billable: boolean;
  employees?: mongoose.Types.ObjectId[];
  status?: boolean;
  supervisor?: mongoose.Types.ObjectId;
}

export interface IUpdateProjectParams extends Partial<ICreateProjectParams> {
  _id?: string;
}

// Service interfaces
export interface CreateProjectParams {
  projectName: string;
  billable: boolean;
  employees?: string[];
  supervisor?: string | null;
  status?: boolean;
}