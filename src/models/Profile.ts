import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
    skills: string[];
    resumeContent: string; // Store LaTeX content or path
    resumeName: string;
}

const ProfileSchema: Schema = new Schema({
    skills: [{ type: String }],
    resumeContent: { type: String },
    resumeName: { type: String },
}, { timestamps: true });

const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
