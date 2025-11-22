import { JobScraper, ScrapedJob } from './types';
import * as cheerio from 'cheerio';

export class WeWorkRemotelyScraper implements JobScraper {
    name = 'We Work Remotely';
    private rssUrl = 'https://weworkremotely.com/remote-jobs.rss';

    async scrape(): Promise<ScrapedJob[]> {
        console.log(`Scraping ${this.name}...`);
        try {
            const response = await fetch(this.rssUrl);
            const text = await response.text();
            const $ = cheerio.load(text, { xmlMode: true });
            const jobs: ScrapedJob[] = [];

            $('item').each((_, element) => {
                const title = $(element).find('title').text();
                const link = $(element).find('link').text();
                const description = $(element).find('description').text();
                const pubDate = $(element).find('pubDate').text();

                // WWR RSS doesn't explicitly separate company/location in standard fields always,
                // but title is often "Company: Position" or similar.
                // Let's try to parse title or just use it as is.
                // Actually WWR RSS title format: "Job Title: Company Name"

                let jobTitle = title;
                let company = 'Unknown';

                if (title.includes(':')) {
                    const parts = title.split(':');
                    company = parts[parts.length - 1].trim();
                    jobTitle = parts.slice(0, -1).join(':').trim();
                }

                // Check for "Worldwide" or "Anywhere" in description or title
                const content = (jobTitle + description).toLowerCase();
                const isWorldwide = content.includes('worldwide') || content.includes('anywhere') || content.includes('global');

                jobs.push({
                    title: jobTitle,
                    company,
                    description, // This is HTML content
                    url: link,
                    source: this.name,
                    skills: [], // Hard to extract without NLP or keyword matching
                    location: isWorldwide ? 'Worldwide' : 'Remote',
                    isWorldwide,
                    datePosted: new Date(pubDate),
                });
            });

            return jobs;
        } catch (error) {
            console.error(`Error scraping ${this.name}:`, error);
            return [];
        }
    }
}
