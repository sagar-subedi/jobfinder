import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
    skills: string[];
    projects: {
        title: string;
        description: string;
        techStack: string[];
    }[];
    experiences: {
        company: string;
        role: string;
        duration: string;
        description: string;
    }[];
    templates: {
        _id: string;
        name: string;
        content: string;
        createdAt: Date;
    }[];
}

const ProfileSchema: Schema = new Schema({
    skills: [{ type: String }],
    projects: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        techStack: [{ type: String }],
    }],
    experiences: [{
        company: { type: String, required: true },
        role: { type: String, required: true },
        duration: { type: String, required: true },
        description: { type: String, required: true },
    }],
    templates: [{
        name: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
