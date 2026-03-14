import { getDocBySlug, getAllDocsSlugs, getConfig, getFlatDocLinks } from "@/lib/docs";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Metadata } from "next";
import { ChevronRight, Home, ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import MermaidDiagram from "@/components/MermaidDiagram";

function getMermaidChart(children: React.ReactNode): string | null {
    if (!React.isValidElement(children)) {
        return null;
    }

    const childProps = children.props as {
        className?: string;
        children?: React.ReactNode;
    };

    if (!childProps.className?.includes("language-mermaid")) {
        return null;
    }

    if (typeof childProps.children === "string") {
        return childProps.children.trim();
    }

    if (Array.isArray(childProps.children)) {
        return childProps.children.join("").trim();
    }

    return null;
}

export async function generateStaticParams() {
    const slugs = getAllDocsSlugs();
    return slugs.map((slug) => ({
        slug: slug.length > 0 ? slug : undefined,
    }));
}

export async function generateMetadata({ params }: { params: { slug?: string[] } }): Promise<Metadata> {
    const doc = getDocBySlug(params.slug);
    if (!doc) {
        return {
            title: params.slug && params.slug.length > 0 ? "Not Found" : "Setup Required",
            description: "__SITE_DESCRIPTION__"
        };
    }
    return {
        title: `${doc.title} - __SITE_NAME__`,
        description: `Read documentation for ${doc.title}.`,
    };
}

export default async function DocPage({ params }: { params: { slug?: string[] } }) {
    const doc = getDocBySlug(params.slug);
    const config = getConfig();

    const isRoot = !params.slug || params.slug.length === 0;

    if (!doc) {
        if (isRoot) {
            return <SetupGuide />;
        }
        notFound();
    }

    const currSlugStr = isRoot ? '/' : '/' + (params.slug || []).join('/');

    const flatPages = getFlatDocLinks();
    const currentIndex = flatPages.findIndex(p => p.slug === currSlugStr);
    const nextDoc = currentIndex !== -1 && currentIndex < flatPages.length - 1 ? flatPages[currentIndex + 1] : null;

    // Premium Custom MDX Styling setup matching Fixoria's brand
    const components = {
        h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-8 pb-4 border-b border-zinc-800/60" {...props} />,
        h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-12 mb-6 pb-2 border-b border-zinc-800/40 text-zinc-100" {...props} />,
        h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-xl font-medium tracking-tight mt-8 mb-4 text-zinc-200" {...props} />,
        p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="leading-7 text-zinc-400 mb-6" {...props} />,
        ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc leading-7 text-zinc-400 mb-6 pl-6 space-y-2 marker:text-zinc-600" {...props} />,
        ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal leading-7 text-zinc-400 mb-6 pl-6 space-y-2 marker:text-zinc-600" {...props} />,
        li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="pl-1" {...props} />,
        a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-white font-medium hover:text-blue-400 underline decoration-zinc-700 hover:decoration-blue-400/50 transition-all underline-offset-4" {...props} />,
        blockquote: (props: React.QuoteHTMLAttributes<HTMLQuoteElement>) => <blockquote className="border-l-4 border-white/20 pl-6 italic text-zinc-300 my-8 bg-zinc-900/40 py-4 pr-6 rounded-r-2xl shadow-sm" {...props} />,
        code: (props: React.HTMLAttributes<HTMLElement>) => <code className="bg-zinc-900 border border-zinc-800/80 rounded-md px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-200 shadow-sm" {...props} />,
        pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
            const mermaidChart = getMermaidChart(props.children);
            if (mermaidChart) {
                return <MermaidDiagram chart={mermaidChart} />;
            }

            return <pre className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-5 overflow-x-auto my-8 shadow-2xl custom-scrollbar" {...props} />;
        },
        table: (props: React.TableHTMLAttributes<HTMLTableElement>) => <div className="overflow-x-auto my-8 border border-zinc-800/80 rounded-2xl shadow-sm"><table className="w-full text-left text-sm" {...props} /></div>,
        th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className="border-b border-zinc-800 bg-zinc-900/60 p-4 font-medium text-zinc-200 text-sm tracking-wide" {...props} />,
        td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className="p-4 border-b border-zinc-800/40 text-zinc-400" {...props} />,
        hr: (props: React.HTMLAttributes<HTMLHRElement>) => <hr className="my-10 border-zinc-800" {...props} />,
    };

    const breadcrumbs = doc.slug && doc.slug.length > 0 ? doc.slug : [];

    return (
        <article className="max-w-[750px] w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

            {/* Breadcrumb Navigation */}
            {breadcrumbs.length > 0 && (
                <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 font-medium mb-12">
                    <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5" />
                    </Link>
                    {breadcrumbs.map((crumb, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                            <span className={idx === breadcrumbs.length - 1 ? 'text-zinc-200' : 'text-zinc-500 capitalize'}>
                                {crumb.replace(/-/g, ' ')}
                            </span>
                        </div>
                    ))}
                </nav>
            )}

            {/* Main Content Render */}
            <div className="prose-custom max-w-none text-base">
                <MDXRemote source={doc.content} components={components} />
            </div>

            {/* Up Next Section */}
            {nextDoc && (
                <div className="mt-16">
                    <p className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Up next</p>
                    <Link
                        href={nextDoc.slug}
                        className="group relative flex flex-col p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-800/40 transition-all overflow-hidden"
                    >
                        {/* Subtle gradient background on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/0 via-zinc-800/0 to-zinc-800/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors mb-1">
                                    {nextDoc.title}
                                </h4>
                                {nextDoc.categoryTitle && (
                                    <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                        {nextDoc.categoryTitle}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                                <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Bottom Engagement Footer */}
            {config.contactSupport && (config.contactSupport.title || config.contactSupport.description || config.contactSupport.buttonText) && (
                <div className="mt-20 pt-10 border-t border-zinc-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm text-zinc-500 bg-zinc-900/10 rounded-2xl p-6">
                    <div>
                        {config.contactSupport.title && <p className="text-zinc-300 font-medium mb-1">{config.contactSupport.title}</p>}
                        {config.contactSupport.description && <p>{config.contactSupport.description}</p>}
                    </div>
                    {config.contactSupport.buttonText && config.contactSupport.buttonLink && (
                        <a href={config.contactSupport.buttonLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 group">
                            {config.contactSupport.buttonText}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                    )}
                </div>
            )}
        </article>
    );
}

function SetupGuide() {
    return (
        <div className="max-w-[750px] w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out py-12">
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-8 shadow-lg shadow-white/5">
                    <Home className="w-6 h-6 text-black" />
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
                    Setup Your Homepage
                </h1>

                <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                    It looks like you haven&apos;t configured a homepage yet. Follow these simple steps to get your landing page live.
                </p>

                <div className="space-y-6">
                    <div className="flex gap-4 group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 group-hover:bg-zinc-700 transition-colors">1</div>
                        <div>
                            <h3 className="text-zinc-100 font-semibold mb-1">Create your content</h3>
                            <p className="text-zinc-500 text-sm">Create a <code className="text-zinc-300">index.md</code> or <code className="text-zinc-300">home.md</code> file in your <code className="text-zinc-300">content/</code> directory.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 group-hover:bg-zinc-700 transition-colors">2</div>
                        <div>
                            <h3 className="text-zinc-100 font-semibold mb-1">Update your config</h3>
                            <p className="text-zinc-500 text-sm">In <code className="text-zinc-300">content/config.json</code>, set the <code className="text-zinc-300">&quot;homepage&quot;</code> property to point to your new file.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 group-hover:bg-zinc-700 transition-colors">3</div>
                        <div>
                            <h3 className="text-zinc-100 font-semibold mb-1">Refresh</h3>
                            <p className="text-zinc-500 text-sm">Once saved, your homepage will instantly appear here with the site styling applied.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 p-5 rounded-xl bg-zinc-500/5 border border-zinc-800/50">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mb-3">Example config.json</p>
                    <pre className="text-zinc-300 font-mono text-xs overflow-x-auto">
                        {`{
  "homepage": "index.md",
  "sidebar": [ ... ]
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
