'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Globe, ChevronDown, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

const AVAILABLE_SOURCES = [
    { id: 'We Work Remotely', label: 'We Work Remotely' },
    { id: 'RemoteOK', label: 'RemoteOK' },
    { id: 'Remotive', label: 'Remotive' },
    { id: 'Jobspresso', label: 'Jobspresso' },
    { id: 'Working Nomads', label: 'Working Nomads' }
];

export default function FilterBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [worldwideOnly, setWorldwideOnly] = useState(searchParams.get('worldwide') === 'true');
    const [skills, setSkills] = useState(searchParams.get('skills') || '');
    const [selectedSources, setSelectedSources] = useState<string[]>(
        searchParams.get('sources')?.split(',').filter(Boolean) || []
    );
    const [showSourceDropdown, setShowSourceDropdown] = useState(false);

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (worldwideOnly) params.set('worldwide', 'true');
        if (skills) params.set('skills', skills);
        if (selectedSources.length > 0) params.set('sources', selectedSources.join(','));

        router.push(`/?${params.toString()}`);
    };

    // Debounce search and filters
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, worldwideOnly, skills, selectedSources]);

    const toggleSource = (sourceId: string) => {
        setSelectedSources(prev =>
            prev.includes(sourceId)
                ? prev.filter(id => id !== sourceId)
                : [...prev, sourceId]
        );
    };

    return (
        <div className="w-full flex flex-col md:flex-row gap-4 p-4 bg-secondary/20 backdrop-blur-xl border border-white/5 rounded-xl mb-8 items-center relative z-20">
            <div className="flex items-center gap-2 md:border-r md:border-white/5 md:pr-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Filter className="text-primary" size={20} />
                </div>
                <span className="font-bold hidden md:block">Filters</span>
            </div>

            <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row gap-4">
                <div className="relative group flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search jobs..."
                        className="w-full bg-background border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                </div>

                <div className="relative group flex-1">
                    <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="Skills (e.g. React, Node)"
                        className="w-full bg-background border border-white/10 rounded-lg py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                </div>

                {/* Source Filter Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                        className="w-full md:w-48 flex items-center justify-between bg-background border border-white/10 rounded-lg py-2.5 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    >
                        <span className="truncate">
                            {selectedSources.length === 0
                                ? 'All Sources'
                                : `${selectedSources.length} Source${selectedSources.length > 1 ? 's' : ''}`}
                        </span>
                        <ChevronDown size={14} className="text-muted-foreground" />
                    </button>

                    {showSourceDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowSourceDropdown(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-secondary border border-white/10 rounded-lg shadow-xl z-50 p-2 animate-fade-in">
                                <div className="text-xs font-bold text-muted-foreground px-2 py-1 mb-1 uppercase tracking-wider">
                                    Filter by Source
                                </div>
                                {AVAILABLE_SOURCES.map((source) => (
                                    <button
                                        key={source.id}
                                        onClick={() => toggleSource(source.id)}
                                        className="w-full flex items-center justify-between px-2 py-2 text-sm rounded hover:bg-white/5 transition-colors text-left"
                                    >
                                        <span className={clsx(selectedSources.includes(source.id) ? "text-foreground" : "text-muted-foreground")}>
                                            {source.label}
                                        </span>
                                        {selectedSources.includes(source.id) && (
                                            <Check size={14} className="text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 md:border-l md:border-white/5 md:pl-4 w-full md:w-auto justify-between md:justify-start">
                <label className="relative inline-flex items-center cursor-pointer gap-3 group">
                    <input
                        type="checkbox"
                        checked={worldwideOnly}
                        onChange={(e) => setWorldwideOnly(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Globe size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="hidden md:inline">Worldwide</span>
                        <span className="md:hidden">Worldwide Only</span>
                    </span>
                </label>
            </div>
        </div>
    );
}
