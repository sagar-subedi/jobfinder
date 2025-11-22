import { IJob } from '@/models/Job';

export interface ScrapedJob {
    title: string;
    company: string;
    description: string;
    url: string;
    source: string;
    skills: string[];
    location: string;
    isWorldwide: boolean;
    datePosted: Date;
}

export interface JobScraper {
    name: string;
    scrape(): Promise<ScrapedJob[]>;
}
