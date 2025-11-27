import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';

// Helper to get or create default profile
async function getProfile() {
    await dbConnect();
    let profile = await Profile.findOne();
    if (!profile) {
        profile = await Profile.create({
            skills: [],
            templates: [],
            projects: [],
            experiences: []
        });
    }
    return profile;
}

export async function GET() {
    try {
        const profile = await getProfile();
        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const profile = await getProfile();

        if (body.skills) profile.skills = body.skills;
        if (body.projects) profile.projects = body.projects;
        if (body.experiences) profile.experiences = body.experiences;

        await profile.save();

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
