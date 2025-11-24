'use client';

import React, { useState } from 'react';
import { IJob } from '@/models/Job';
import JobCard from './JobCard';
import JobDetailModal from './JobDetailModal';

interface JobGridProps {
    jobs: IJob[];
}

export default function JobGrid({ jobs }: JobGridProps) {
    const [selectedJob, setSelectedJob] = useState<IJob | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        <p>No jobs found. Try adjusting filters or refreshing.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={String(job._id)} onClick={() => setSelectedJob(job)} className="cursor-pointer">
                            <JobCard job={job} />
                        </div>
                    ))
                )}
            </div>

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    isOpen={!!selectedJob}
                    onClose={() => setSelectedJob(null)}
                />
            )}
        </>
    );
}
