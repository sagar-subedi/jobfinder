'use client';

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import clsx from 'clsx';

export default function ScrapeButton() {
    const [loading, setLoading] = useState(false);

    const handleScrape = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/jobs/scrape', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                window.location.reload();
            } else {
                alert('Scraping failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error scraping');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleScrape}
            disabled={loading}
            className={clsx(
                "btn btn-secondary flex items-center gap-2 text-sm",
                loading && "opacity-50 cursor-not-allowed"
            )}
        >
            <RefreshCw size={16} className={clsx(loading && "animate-spin")} />
            {loading ? 'Scraping...' : 'Refresh Jobs'}
        </button>
    );
}
