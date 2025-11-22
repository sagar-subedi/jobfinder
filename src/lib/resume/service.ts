export async function customizeResume(resumeContent: string, jobDescription: string): Promise<string> {
    // Mock AI Customization Logic
    // In a real app, this would call OpenAI API with the resume and JD.

    console.log('Customizing resume for JD length:', jobDescription.length);

    // Simple heuristic: Find \section{Skills} or similar and append a mock skill from JD
    // Or just append a comment to prove it worked.

    let customized = resumeContent;

    // 1. Add a comment at the top
    customized = `% Customized for Job Description: ${jobDescription.substring(0, 50)}...\n` + customized;

    // 2. Try to find a place to inject a "Customized Skill"
    // This is very naive but demonstrates the concept.
    if (customized.includes('\\section{Skills}')) {
        customized = customized.replace(
            '\\section{Skills}',
            '\\section{Skills}\n% AI Suggestion: Highlight skills relevant to this job.\n'
        );
    }

    // 3. Replace a placeholder if it exists
    customized = customized.replace('{{OBJECTIVE}}', `Passionate developer looking to contribute to ${jobDescription.substring(0, 20)}...`);

    return customized;
}
