import mongoose, { Schema } from 'mongoose';
import { HistoryActionType } from '../constants/historyActionType';
import { IHistory } from '../interfaces/history';

const historySchema = new Schema<IHistory>(
  {
    actionType: {
      type: String,
      enum: Object.values(HistoryActionType),
      required: true,
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetEntity: {
      type: {
        type: String,
        enum: ['User', 'Project', 'Team'],
        required: true,
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'targetEntity.type',
      },
      name: {
        type: String,
        required: true,
      },
    },
    affectedEntity: {
      type: {
        type: String,
        enum: ['User', 'Project', 'Team'],
      },
      id: {
        type: Schema.Types.ObjectId,
        refPath: 'affectedEntity.type',
      },
      name: {
        type: String,
      },
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
historySchema.index({ actionType: 1, timestamp: -1 });
historySchema.index({ 'targetEntity.type': 1, timestamp: -1 });
historySchema.index({ performedBy: 1, timestamp: -1 });

const History = mongoose.model<IHistory>('History', historySchema);

export default History;
