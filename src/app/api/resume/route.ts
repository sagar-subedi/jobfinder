import { NextResponse } from 'next/server';
import { customizeResume } from '@/lib/resume/service';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('resume') as File;
        const jobDescription = formData.get('jobDescription') as string;

        if (!file || !jobDescription) {
            return NextResponse.json({ error: 'Missing file or job description' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const content = buffer.toString('utf-8');

        const customizedContent = await customizeResume(content, jobDescription);

        return NextResponse.json({ customizedContent });
    } catch (error) {
        console.error('Resume customization error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
