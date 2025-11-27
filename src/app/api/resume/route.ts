import { NextResponse } from 'next/server';
import { customizeResume } from '@/lib/resume/service';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';

// Helper to get or create default profile
async function getProfile() {
    await dbConnect();
    let profile = await Profile.findOne();
    if (!profile) {
        profile = await Profile.create({ skills: [], templates: [] });
    }
    return profile;
}

export async function GET() {
    try {
        const profile = await getProfile();
        return NextResponse.json({ templates: profile.templates });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const action = formData.get('action');

        if (action === 'upload') {
            const file = formData.get('resume') as File;
            const name = formData.get('name') as string;

            if (!file || !name) {
                return NextResponse.json({ error: 'Missing file or name' }, { status: 400 });
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const content = buffer.toString('utf-8');

            const profile = await getProfile();
            profile.templates.push({ name, content } as any);
            await profile.save();

            return NextResponse.json({ success: true, templates: profile.templates });
        }

        if (action === 'customize') {
            const jobDescription = formData.get('jobDescription') as string;
            const templateId = formData.get('templateId') as string;

            // Allow direct file upload for customization without saving (legacy/quick mode)
            const file = formData.get('resume') as File;

            let content = '';

            if (templateId) {
                const profile = await getProfile();
                const template = profile.templates.find((t: any) => t._id.toString() === templateId);
                if (!template) {
                    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
                }
                content = template.content;
            } else if (file) {
                const buffer = Buffer.from(await file.arrayBuffer());
                content = buffer.toString('utf-8');
            } else {
                return NextResponse.json({ error: 'Missing template or file' }, { status: 400 });
            }

            if (!jobDescription) {
                return NextResponse.json({ error: 'Missing job description' }, { status: 400 });
            }

            const profile = await getProfile();
            const customizedContent = await customizeResume(content, jobDescription, profile);
            return NextResponse.json({ customizedContent });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Resume API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const profile = await getProfile();
        profile.templates = profile.templates.filter((t: any) => t._id.toString() !== id);
        await profile.save();

        return NextResponse.json({ success: true, templates: profile.templates });
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
