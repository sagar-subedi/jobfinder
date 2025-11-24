import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
    skills: string[];
    templates: {
        _id: string;
        name: string;
        content: string;
        createdAt: Date;
    }[];
}

const ProfileSchema: Schema = new Schema({
    skills: [{ type: String }],
    templates: [{
        name: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
