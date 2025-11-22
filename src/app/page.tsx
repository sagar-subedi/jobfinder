import React from 'react';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import JobCard from '@/components/JobCard';
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

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {jobs.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-muted-foreground">
                                <p>No jobs found. Try adjusting filters or refreshing.</p>
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <JobCard key={job._id.toString()} job={job} />
                            ))
                        )}
                    </div>

                    {/* Simple Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {page > 1 && (
                                <a href={`/?page=${page - 1}`} className="btn btn-secondary">Previous</a>
                            )}
                            <span className="flex items-center px-4 text-muted">
                                Page {page} of {totalPages}
                            </span>
                            {page < totalPages && (
                                <a href={`/?page=${page + 1}`} className="btn btn-secondary">Next</a>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
