import React from 'react';
import { IJob } from '@/models/Job';
import { MapPin, Calendar, Globe, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

interface JobCardProps {
    job: IJob;
}

export default function JobCard({ job }: JobCardProps) {
    const formattedDate = new Date(job.datePosted).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="card flex flex-col gap-4 group relative overflow-hidden border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/20 text-primary-foreground border border-primary/30">
                            {job.source}
                        </span>
                        {job.isWorldwide && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded border border-green-500/30 flex items-center gap-1">
                                <Globe size={12} /> Worldwide
                            </span>
                        )}
                    </div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            {job.title}
                            <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                        </a>
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium">{job.company}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
                {job.skills.slice(0, 5).map((skill, i) => (
                    <span key={i} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded border border-white/10">
                        {skill}
                    </span>
                ))}
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{formattedDate}</span>
                </div>
            </div>
        </div>
    );
}
