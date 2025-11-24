import { JobScraper, ScrapedJob } from './types';

export class WorkingNomadsScraper implements JobScraper {
    name = 'Working Nomads';
    private apiUrl = 'https://www.workingnomads.com/jobsapi/_search';

    async scrape(): Promise<ScrapedJob[]> {
        console.log(`Scraping ${this.name}...`);
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (compatible; JobFinder/1.0;)'
                },
                body: JSON.stringify({
                    from: 0,
                    size: 50,
                    sort: [{ pub_date: { order: 'desc' } }],
                    _source: [
                        'title',
                        'company',
                        'pub_date',
                        'apply_url',
                        'tags',
                        'locations',
                        'description',
                        'category_name'
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Working Nomads API Error: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const hits = data.hits?.hits || [];

            return hits.map((hit: any) => {
                const source = hit._source;

                // Construct full URL if apply_url is relative or missing
                // Working Nomads usually provides external apply links or internal ones
                let url = source.apply_url;
                if (!url) {
                    // Fallback to working nomads job page if apply_url is missing
                    // URL structure: https://www.workingnomads.com/jobs/slug
                    // We need slug from source if available, otherwise just base
                    url = source.slug ? `https://www.workingnomads.com/jobs/${source.slug}` : 'https://www.workingnomads.com/jobs';
                }

                const isWorldwide = (source.locations || []).some((loc: any) =>
                    loc.name?.toLowerCase().includes('worldwide') ||
                    loc.name?.toLowerCase().includes('anywhere') ||
                    loc.name?.toLowerCase().includes('global')
                );

                return {
                    title: source.title,
                    company: source.company,
                    description: source.description || 'No description available',
                    url: url,
                    source: this.name,
                    skills: source.tags || [],
                    location: source.locations?.map((l: any) => l.name).join(', ') || 'Remote',
                    isWorldwide: isWorldwide,
                    datePosted: new Date(source.pub_date),
                };
            });

        } catch (error) {
            console.error(`Error scraping ${this.name}:`, error);
            return [];
        }
    }
}
