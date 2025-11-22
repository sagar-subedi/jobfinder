import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { WeWorkRemotelyScraper } from '@/lib/scrapers/WeWorkRemotely';
import { RemoteOKScraper } from '@/lib/scrapers/RemoteOK';

export async function POST() {
    try {
        await dbConnect();

        const scrapers = [
            new WeWorkRemotelyScraper(),
            new RemoteOKScraper(),
        ];

        let totalAdded = 0;

        for (const scraper of scrapers) {
            const jobs = await scraper.scrape();

            for (const jobData of jobs) {
                // Upsert job based on URL to avoid duplicates
                const result = await Job.updateOne(
                    { url: jobData.url },
                    { $set: jobData },
                    { upsert: true }
                );

                if (result.upsertedCount > 0) {
                    totalAdded++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Scraping complete. Added ${totalAdded} new jobs.`
        });
    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ success: false, error: 'Scraping failed' }, { status: 500 });
    }
}
