'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [worldwideOnly, setWorldwideOnly] = useState(searchParams.get('worldwide') === 'true');
    const [skills, setSkills] = useState(searchParams.get('skills') || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (worldwideOnly) params.set('worldwide', 'true');
        if (skills) params.set('skills', skills);

        router.push(`/?${params.toString()}`);
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, worldwideOnly, skills]);

    return (
        <aside className="w-full md:w-72 flex-shrink-0 flex flex-col gap-6 p-6 border-r border-white/5 h-fit md:min-h-screen sticky top-0 bg-secondary/30 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Filter className="text-primary" size={20} />
                </div>
                <h2 className="text-lg font-bold tracking-tight">Filters</h2>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground">Search</label>
                <div className="relative group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Job title, company..."
                        className="w-full bg-background border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground">Skills (comma separated)</label>
                <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Node, Python"
                    className="w-full bg-background border border-white/10 rounded-lg py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
            </div>

            <div className="flex items-center gap-3 mt-4 p-3 bg-background/50 rounded-lg border border-border">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={worldwideOnly}
                        onChange={(e) => setWorldwideOnly(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-foreground">Worldwide Only</span>
                </label>
            </div>
        </aside>
    );
}
