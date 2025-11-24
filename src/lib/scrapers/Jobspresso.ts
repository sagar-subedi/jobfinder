import { JobScraper, ScrapedJob } from './types';
import * as cheerio from 'cheerio';

export class JobspressoScraper implements JobScraper {
    name = 'Jobspresso';

    async scrape(): Promise<ScrapedJob[]> {
        try {
            const response = await fetch('https://jobspresso.co/feed/');
            if (!response.ok) {
                throw new Error(`Failed to fetch Jobspresso feed: ${response.statusText}`);
            }

            const xml = await response.text();
            const $ = cheerio.load(xml, { xmlMode: true });
            const jobs: ScrapedJob[] = [];

            $('item').each((_, element) => {
                const title = $(element).find('title').text();
                const link = $(element).find('link').text();
                const pubDate = $(element).find('pubDate').text();
                const description = $(element).find('description').text();
                // Jobspresso RSS doesn't always have explicit company/location tags in standard fields,
                // but often puts "Company Name" in title like "Role at Company".
                // For simplicity, we'll parse what we can.

                // Attempt to extract company from title if format is "Role at Company"
                let company = 'Unknown';
                let jobTitle = title;
                if (title.includes(' at ')) {
                    const parts = title.split(' at ');
                    jobTitle = parts[0];
                    company = parts[parts.length - 1];
                }

                // Jobspresso is all remote, but specific location restrictions aren't always in RSS.
                // We'll default to Remote and check description for keywords if needed.
                const isWorldwide = true; // Jobspresso is heavily focused on remote, often worldwide.

                jobs.push({
                    title: jobTitle,
                    company: company,
                    description: description, // This might contain HTML
                    url: link,
                    source: 'Jobspresso',
                    skills: [], // RSS doesn't provide tags easily
                    location: 'Remote',
                    isWorldwide: isWorldwide,
                    datePosted: new Date(pubDate)
                });
            });

            return jobs;
        } catch (error) {
            console.error('Error scraping Jobspresso:', error);
            return [];
        }
    }
}
