import mongoose, { Document, Schema } from 'mongoose';

export interface IPhase {
  name: string;
  start: Date;
  end: Date;
  status: 'past' | 'current' | 'future';
  spent: number;
}

export interface IChallenge {
  _id?: string;
  description: string;
  mediaUrls: string[];
  status: 'pending' | 'valid' | 'declined';
  adminNote?: string;
  createdAt: Date;
}

export interface IProject extends Document {
  projectId: string;
  seatId: number;
  name: string;
  manager: string;
  status: string;
  startDate: Date;
  endDate: Date;
  location: string;
  budget: number;
  actualCompletion: number;
  milestone: string;
  phases: IPhase[];
  challenges: IChallenge[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    projectId: { type: String, required: true, unique: true },
    seatId: { type: Number, required: true },
    name: { type: String, required: true },
    manager: { type: String, required: true },
    status: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    actualCompletion: { type: Number, required: true },
    milestone: { type: String, required: true },
    phases: [{
      name: { type: String, required: true },
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      status: { type: String, enum: ['past', 'current', 'future'], default: 'future' },
      spent: { type: Number, default: 0 }
    }],
    challenges: [{
      description: { type: String, required: true },
      mediaUrls: [{ type: String }],
      status: { type: String, enum: ['pending', 'valid', 'declined'], default: 'pending' },
      adminNote: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
