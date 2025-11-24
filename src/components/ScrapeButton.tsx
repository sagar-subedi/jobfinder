'use client';

import React, { useState } from 'react';
import { RefreshCw, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

const AVAILABLE_SOURCES = [
    { id: 'We Work Remotely', label: 'We Work Remotely' },
    { id: 'RemoteOK', label: 'RemoteOK' },
    { id: 'Remotive', label: 'Remotive' },
    { id: 'Jobspresso', label: 'Jobspresso' },
    { id: 'Working Nomads', label: 'Working Nomads' }
];

export default function ScrapeButton() {
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedSources, setSelectedSources] = useState<string[]>(AVAILABLE_SOURCES.map(s => s.id));
    const router = useRouter();

    const toggleSource = (sourceId: string) => {
        setSelectedSources(prev =>
            prev.includes(sourceId)
                ? prev.filter(id => id !== sourceId)
                : [...prev, sourceId]
        );
    };

    const handleScrape = async () => {
        if (selectedSources.length === 0) return;

        setLoading(true);
        setShowDropdown(false);
        try {
            const response = await fetch('/api/jobs/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sources: selectedSources }),
            });

            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to scrape jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <div className="flex items-center rounded-lg bg-primary hover:bg-primary-hover transition-colors">
                <button
                    onClick={handleScrape}
                    disabled={loading || selectedSources.length === 0}
                    className="flex items-center gap-2 px-4 py-2 font-medium text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={16} className={clsx({ 'animate-spin': loading })} />
                    {loading ? 'Scraping...' : 'Scrape Jobs'}
                </button>
                <div className="w-[1px] h-6 bg-primary-foreground/20"></div>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={loading}
                    className="px-2 py-2 hover:bg-white/10 rounded-r-lg transition-colors text-primary-foreground disabled:opacity-50"
                >
                    <ChevronDown size={16} />
                </button>
            </div>

            {showDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-secondary border border-white/10 rounded-lg shadow-xl z-50 p-2 animate-fade-in">
                        <div className="text-xs font-bold text-muted-foreground px-2 py-1 mb-1 uppercase tracking-wider">
                            Select Sources
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
    );
}
