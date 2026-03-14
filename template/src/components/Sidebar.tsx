'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Book, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

type SidebarNode = {
    title: string;
    slug?: string;
    children: SidebarNode[];
};

export default function Sidebar({ tree }: { tree: SidebarNode }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on mobile when navigating
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const renderTree = (node: SidebarNode, level: number = 0) => {
        return (
            <ul className={clsx("flex flex-col gap-1", level > 0 && "pl-4 border-l border-zinc-800/80 ml-2 mt-1")}>
                {node.children.map((child, index) => {
                    const isActive = pathname === child.slug || (pathname === '/' && child.slug === '/');

                    return (
                        <li key={child.slug || index}>
                            {child.slug ? (
                                <Link
                                    href={child.slug}
                                    className={clsx(
                                        "flex items-center text-sm px-3 py-1.5 rounded-lg transition-colors duration-200",
                                        isActive
                                            ? "bg-white/10 text-white font-medium"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {child.title}
                                </Link>
                            ) : (
                                <div className="flex items-center text-sm px-3 py-2 text-zinc-300 font-semibold mt-2">
                                    {child.title}
                                </div>
                            )}
                            {child.children?.length > 0 && renderTree(child, level + 1)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-0 left-0 w-full bg-zinc-950 border-b border-zinc-800 z-50 flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                        <Book className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">__SITE_NAME__</span>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white">
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside className={clsx(
                "fixed md:sticky top-0 left-0 h-[100dvh] w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 overflow-y-auto custom-scrollbar flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6">
                    <Link href="/" className="mb-8 flex items-center gap-3">
                        <div className="w-8 h-8 flex-shrink-0 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            <Book className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            __SITE_NAME__
                        </span>
                    </Link>
                    <div className="mt-8">
                        {renderTree(tree)}
                    </div>
                </div>
            </aside>
        </>
    );
}
