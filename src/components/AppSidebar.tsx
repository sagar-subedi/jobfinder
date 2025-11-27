'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, FileText, Bookmark, Settings, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: 'Find Jobs', href: '/', icon: Briefcase },
    { name: 'Resume AI', href: '/resume', icon: FileText },
    { name: 'My Profile', href: '/profile', icon: Settings },
    { name: 'Saved Jobs', href: '/saved', icon: Bookmark, dummy: true },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, dummy: true },
];

export default function AppSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-secondary/20 backdrop-blur-xl h-screen sticky top-0 flex flex-col">
            <div className="p-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <Briefcase size={18} className="text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">JobFinder</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.dummy ? '#' : item.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}
                            onClick={(e) => item.dummy && e.preventDefault()}
                        >
                            <item.icon size={18} />
                            {item.name}
                            {item.dummy && (
                                <span className="ml-auto text-[10px] uppercase font-bold bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground">
                                    Soon
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        JD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">John Doe</span>
                        <span className="text-xs text-muted-foreground">Pro Plan</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
