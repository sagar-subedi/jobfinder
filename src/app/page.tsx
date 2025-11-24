import React from 'react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import JobCard from '@/components/JobCard';
import JobGrid from '@/components/JobGrid';
import FilterBar from '@/components/FilterBar';
import ScrapeButton from '@/components/ScrapeButton';

export const dynamic = 'force-dynamic';

async function getJobs(searchParams: { [key: string]: string | string[] | undefined }) {
    await dbConnect();

    const query: any = {};

    if (searchParams.q) {
        const searchRegex = new RegExp(searchParams.q as string, 'i');
        query.$or = [
            { title: searchRegex },
            { company: searchRegex },
            { description: searchRegex },
        ];
    }

    if (searchParams.worldwide === 'true') {
        query.isWorldwide = true;
    }

    if (searchParams.skills) {
        const skills = (searchParams.skills as string).split(',').map(s => s.trim());
        // Simple regex match for skills in description or title if not explicitly tagged
        // Or if we had a skills array in DB, we'd use $in. 
        // Since our scrapers don't perfectly extract skills yet, we'll search description.
        const skillRegex = new RegExp(skills.join('|'), 'i');
        query.$or = [
            ...(query.$or || []),
            { description: skillRegex },
            { title: skillRegex }
        ];
    }

    if (searchParams.sources) {
        const sources = (searchParams.sources as string).split(',').filter(Boolean);
        if (sources.length > 0) {
            query.source = { $in: sources };
        }
    }

    // Pagination
    const page = parseInt(searchParams.page as string || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
        .sort({ datePosted: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Job.countDocuments(query);

    return { jobs, total, page, totalPages: Math.ceil(total / limit) };
}

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const { jobs, total, page, totalPages } = await getJobs(resolvedSearchParams);

    return (
        <div className="min-h-full flex flex-col">

            <div className="flex-1 container py-8 max-w-[1600px] mx-auto px-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Find your next role</h1>
                    <ScrapeButton />
                </div>

                <FilterBar />

                <main className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-muted-foreground">
                            {total} {total === 1 ? 'Job' : 'Jobs'} Found
                            {resolvedSearchParams.worldwide === 'true' && <span className="text-primary text-sm font-normal ml-2">• Worldwide Only</span>}
                        </h2>
                    </div>

                    <JobGrid jobs={JSON.parse(JSON.stringify(jobs))} />

                    {/* Simple Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {page > 1 && (
                                <Link
                                    href={`/?${new URLSearchParams({ ...Object.fromEntries(Object.entries(resolvedSearchParams).filter(([k]) => k !== 'page')), page: String(page - 1) }).toString()}`}
                                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Previous
                                </Link>
                            )}
                            <span className="flex items-center px-4 text-muted-foreground text-sm">
                                Page {page} of {totalPages}
                            </span>
                            {page < totalPages && (
                                <Link
                                    href={`/?${new URLSearchParams({ ...Object.fromEntries(Object.entries(resolvedSearchParams).filter(([k]) => k !== 'page')), page: String(page + 1) }).toString()}`}
                                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
