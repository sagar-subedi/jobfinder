import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Prevent initialization error during build
});

export async function customizeResume(resumeContent: string, jobDescription: string, profile?: any): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('OPENAI_API_KEY not found, using mock implementation');
        return mockCustomizeResume(resumeContent, jobDescription);
    }

    try {
        const profileContext = profile ? `
        MASTER PROFILE DATA:
        Skills: ${profile.skills?.join(', ') || 'None'}
        
        Projects:
        ${profile.projects?.map((p: any) => `- ${p.title}: ${p.description} (Tech: ${p.techStack?.join(', ')})`).join('\n')}
        
        Experiences:
        ${profile.experiences?.map((e: any) => `- ${e.role} at ${e.company}: ${e.description}`).join('\n')}
        ` : '';

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert resume writer. You will be given a LaTeX resume template, a job description, and a Master Profile containing all the user's skills and projects.
                    
                    YOUR TASK:
                    1. Analyze the Job Description to identify key requirements and skills.
                    2. Select the MOST RELEVANT projects and skills from the Master Profile that match the Job Description.
                    3. Populate the LaTeX template with these selected projects and skills.
                    4. You may rephrase bullet points to better align with the job requirements.
                    5. Do NOT invent information. Only use what is in the Master Profile or the original Resume.
                    6. Output ONLY the valid LaTeX code.
                    `
                },
                {
                    role: "user",
                    content: `Job Description:\n${jobDescription}\n\n${profileContext}\n\nResume Template (LaTeX):\n${resumeContent}`
                }
            ],
            model: "gpt-4o-mini",
        });

        let customized = completion.choices[0].message.content || resumeContent;

        // Clean up markdown code blocks if present
        if (customized.startsWith('```latex')) {
            customized = customized.replace(/^```latex\n/, '').replace(/\n```$/, '');
        } else if (customized.startsWith('```tex')) {
            customized = customized.replace(/^```tex\n/, '').replace(/\n```$/, '');
        } else if (customized.startsWith('```')) {
            customized = customized.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        return customized;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw new Error('Failed to customize resume with AI');
    }
}

function mockCustomizeResume(resumeContent: string, jobDescription: string): string {
    let customized = resumeContent;
    customized = `% Customized for Job Description: ${jobDescription.substring(0, 50)}...\n` + customized;
    if (customized.includes('\\section{Skills}')) {
        customized = customized.replace(
            '\\section{Skills}',
            '\\section{Skills}\n% AI Suggestion: Highlight skills relevant to this job.\n'
        );
    }
    return customized;
}
