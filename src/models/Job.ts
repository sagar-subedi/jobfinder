import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
    title: string;
    company: string;
    description: string;
    url: string;
    source: string;
    skills: string[];
    location: string;
    isWorldwide: boolean;
    datePosted: Date;
    createdAt: Date;
}

const JobSchema: Schema = new Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    skills: [{ type: String }],
    location: { type: String, default: 'Remote' },
    isWorldwide: { type: Boolean, default: false },
    datePosted: { type: Date, default: Date.now, expires: '30d' },
}, { timestamps: true });

// Prevent recompilation of model in development
const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
