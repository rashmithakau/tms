import mongoose from 'mongoose';
import { HistoryActionType } from '../constants/historyActionType';

export interface IHistory extends mongoose.Document {
  actionType: HistoryActionType;
  performedBy: mongoose.Types.ObjectId;
  targetEntity: {
    type: 'User' | 'Project' | 'Team';
    id: mongoose.Types.ObjectId;
    name: string;
  };
  affectedEntity?: {
    type: 'User' | 'Project' | 'Team';
    id: mongoose.Types.ObjectId;
    name: string;
  };
  description: string;
  metadata?: {
    oldValue?: any;
    newValue?: any;
    roleAssigned?: string;
    designation?: string;
    contactNumber?: string;
    [key: string]: any;
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
