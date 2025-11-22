import React from 'react';
import Link from 'next/link';
import { Briefcase, FileText } from 'lucide-react';

export default function Header() {
    return (
        <header className="border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="container flex items-center justify-between h-16">
                <Link href="/" className="text-xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <Briefcase size={18} className="text-primary-foreground" />
                    </div>
                    <span className="tracking-tight">JobFinder</span>
                </Link>

                <nav className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                        <Briefcase size={16} />
                        Find Jobs
                    </Link>
                    <Link href="/resume" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                        <FileText size={16} />
                        Resume AI
                    </Link>
                </nav>
            </div>
        </header>
    );
}
