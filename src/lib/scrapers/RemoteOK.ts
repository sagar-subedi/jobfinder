import { JobScraper, ScrapedJob } from './types';

export class RemoteOKScraper implements JobScraper {
    name = 'RemoteOK';
    private apiUrl = 'https://remoteok.com/api';

    async scrape(): Promise<ScrapedJob[]> {
        console.log(`Scraping ${this.name}...`);
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();

            // RemoteOK API returns an array where the first element is legal text, rest are jobs
            const jobsData = Array.isArray(data) ? data.slice(1) : [];

            return jobsData.map((job: any) => {
                const isWorldwide = job.location?.toLowerCase().includes('worldwide') ||
                    job.location?.toLowerCase().includes('anywhere') ||
                    job.location?.toLowerCase().includes('global');

                return {
                    title: job.position,
                    company: job.company,
                    description: job.description, // HTML content
                    url: job.url,
                    source: this.name,
                    skills: job.tags || [],
                    location: job.location || 'Remote',
                    isWorldwide: isWorldwide,
                    datePosted: new Date(job.date),
                };
            });
        } catch (error) {
            console.error(`Error scraping ${this.name}:`, error);
            return [];
        }
    }
}
