import { JobScraper, ScrapedJob } from './types';

interface RemotiveJob {
    id: number;
    url: string;
    title: string;
    company_name: string;
    publication_date: string;
    candidate_required_location: string;
    salary: string;
    description: string;
    job_type: string;
    tags: string[];
}

interface RemotiveResponse {
    jobs: RemotiveJob[];
}

export class RemotiveScraper implements JobScraper {
    name = 'Remotive';

    async scrape(): Promise<ScrapedJob[]> {
        try {
            const response = await fetch('https://remotive.com/api/remote-jobs?limit=50');
            if (!response.ok) {
                throw new Error(`Failed to fetch Remotive jobs: ${response.statusText}`);
            }

            const data: RemotiveResponse = await response.json();

            return data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: job.description,
                url: job.url,
                source: 'Remotive',
                skills: job.tags || [],
                location: job.candidate_required_location || 'Remote',
                isWorldwide: job.candidate_required_location.toLowerCase().includes('worldwide') ||
                    job.candidate_required_location.toLowerCase().includes('anywhere'),
                datePosted: new Date(job.publication_date)
            }));
        } catch (error) {
            console.error('Error scraping Remotive:', error);
            return [];
        }
    }
}
