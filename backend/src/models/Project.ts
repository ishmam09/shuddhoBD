import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  projectId: string;
  name: string;
  manager: string;
  status: string;
  startDate: Date;
  endDate: Date;
  location: string;
  budget: number;
  actualCompletion: number;
  milestone: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    projectId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    manager: { type: String, required: true },
    status: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    actualCompletion: { type: Number, required: true },
    milestone: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
