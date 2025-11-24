import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { JobScraper } from '@/lib/scrapers/types';
import { WeWorkRemotelyScraper } from '@/lib/scrapers/WeWorkRemotely';
import { RemoteOKScraper } from '@/lib/scrapers/RemoteOK';
import { RemotiveScraper } from '@/lib/scrapers/Remotive';
import { JobspressoScraper } from '@/lib/scrapers/Jobspresso';
import { WorkingNomadsScraper } from '@/lib/scrapers/WorkingNomads';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const selectedSources: string[] = body.sources || [];

        await dbConnect();

        const scrapers: JobScraper[] = [
            new WeWorkRemotelyScraper(),
            new RemoteOKScraper(),
            new RemotiveScraper(),
            new JobspressoScraper(),
            new WorkingNomadsScraper()
        ];

        // Filter scrapers if sources are provided, otherwise use all
        const scrapersToRun = selectedSources.length > 0
            ? scrapers.filter(s => selectedSources.includes(s.name))
            : scrapers;

        if (scrapersToRun.length === 0) {
            return NextResponse.json({ success: false, error: 'No valid sources selected' }, { status: 400 });
        }

        let totalJobs = 0;

        for (const scraper of scrapersToRun) {
            console.log(`Starting scraper: ${scraper.name}`);
            const jobs = await scraper.scrape();
            console.log(`Scraped ${jobs.length} jobs from ${scraper.name}`);

            for (const job of jobs) {
                await Job.updateOne(
                    { url: job.url },
                    { $set: job },
                    { upsert: true }
                );
            }
            totalJobs += jobs.length;
        }

        return NextResponse.json({ success: true, message: `Scraped ${totalJobs} jobs successfully from ${scrapersToRun.map(s => s.name).join(', ')}` });
    } catch (error) {
        console.error('Scraping failed:', error);
        return NextResponse.json({ success: false, error: 'Failed to scrape jobs' }, { status: 500 });
    }
}
