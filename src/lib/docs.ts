import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

const DOCS_DIRECTORY = path.join(process.cwd(), 'content');

export type DocItem = {
    slug: string[];
    title: string;
    content: string;
};

export type DocTree = {
    title: string;
    path?: string[];
    slug?: string; // e.g. /docs/foo/bar
    children: DocTree[];
};

type ConfigSidebarCategory = {
    title: string;
    items: string[];
};

type ConfigContactSupport = {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
};

type DocsConfig = {
    homepage?: string;
    sidebar: ConfigSidebarCategory[];
    contactSupport?: ConfigContactSupport;
};

function normalizeRelativePath(filePath: string): string {
    return path.relative(DOCS_DIRECTORY, filePath).split(path.sep).join('/');
}

function normalizeSlugParams(slugParams: string[] = []): string[] {
    return slugParams.filter(Boolean);
}

const readConfig = cache((): DocsConfig => {
    const configPath = path.join(DOCS_DIRECTORY, 'config.json');
    if (fs.existsSync(configPath)) {
        try {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (e) {
            console.error("Failed to parse config.json", e);
        }
    }
    return { sidebar: [] };
});

function getAllMarkdownFiles(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) return [];

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const markdownFiles: string[] = [];

    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            markdownFiles.push(...getAllMarkdownFiles(entryPath));
            continue;
        }

        if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
            markdownFiles.push(entryPath);
        }
    }

    return markdownFiles;
}

const getMarkdownFiles = cache(() => getAllMarkdownFiles(DOCS_DIRECTORY));

export function getConfig(): DocsConfig {
    return readConfig();
}

const getAllDocsSlugsCached = cache((): string[][] => {
    const config = readConfig();
    const files = getMarkdownFiles();
    const slugs: string[][] = [];

    files.forEach(file => {
        const relativePath = normalizeRelativePath(file);

        if (config.homepage && relativePath === config.homepage) {
            slugs.push([]);
        } else {
            const withoutExt = relativePath.replace(/\.mdx?$/, '');
            if (withoutExt === 'index') {
                slugs.push([]);
            } else {
                const parts = withoutExt.split('/');
                if (parts[parts.length - 1] === 'index') {
                    parts.pop();
                }
                slugs.push(parts);
            }
        }
    });

    // Deduplicate
    return Array.from(new Set(slugs.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));
});

export function getAllDocsSlugs(): string[][] {
    return getAllDocsSlugsCached();
}

const getDocBySlugCached = cache((slugKey: string): DocItem | null => {
    const slugParams = slugKey ? slugKey.split('/') : [];
    const config = readConfig();

    const possiblePaths = [
        path.join(DOCS_DIRECTORY, ...slugParams) + '.md',
        path.join(DOCS_DIRECTORY, ...slugParams) + '.mdx',
        path.join(DOCS_DIRECTORY, ...slugParams, 'index.md'),
        path.join(DOCS_DIRECTORY, ...slugParams, 'index.mdx'),
    ];

    if (slugParams.length === 0 || (slugParams.length === 1 && slugParams[0] === '')) {
        if (config.homepage) {
            possiblePaths.unshift(path.join(DOCS_DIRECTORY, config.homepage));
        } else {
            possiblePaths.unshift(path.join(DOCS_DIRECTORY, 'index.mdx'));
            possiblePaths.unshift(path.join(DOCS_DIRECTORY, 'index.md'));
        }
    }

    let validPath = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            validPath = p;
            break;
        }
    }

    if (!validPath) {
        return null;
    }

    const fileContents = fs.readFileSync(validPath, 'utf8');
    const { data, content } = matter(fileContents);

    let docTitle = data.title;
    if (!docTitle) {
        const match = content.match(/^#\s+(.*)$/m);
        docTitle = match ? match[1].trim() : (slugParams[slugParams.length - 1] || 'Documentation');
    }

    return {
        slug: slugParams,
        title: docTitle,
        content,
    };
});

export function getDocBySlug(slugParams: string[] = []): DocItem | null {
    return getDocBySlugCached(normalizeSlugParams(slugParams).join('/'));
}

const buildSidebarTreeCached = cache((): DocTree => {
    const config = readConfig();
    const root: DocTree = { title: 'Root', children: [] };
    const usedFiles = new Set<string>();

    for (const category of config.sidebar || []) {
        const categoryNode: DocTree = {
            title: category.title,
            children: []
        };

        for (const itemPath of category.items || []) {
            // itemPath is now string like "features/analytics.md" or "index.md"
            const relativePathWoExt = itemPath.replace(/\.mdx?$/, '');
            let slugParams = relativePathWoExt === 'index' ? [] : relativePathWoExt.split('/');

            if (config.homepage && itemPath === config.homepage) {
                slugParams = [];
            } else if (slugParams[slugParams.length - 1] === 'index') {
                slugParams.pop();
            }

            const slugStr = slugParams.length === 0 ? '/' : '/' + slugParams.join('/');
            const doc = getDocBySlug(slugParams);
            const title = doc?.title || relativePathWoExt;

            categoryNode.children.push({
                title: title,
                slug: slugStr,
                children: []
            });
            usedFiles.add(itemPath);
            usedFiles.add(relativePathWoExt);
        }

        if (categoryNode.children.length > 0) {
            root.children.push(categoryNode);
        }
    }

    const allFiles = getMarkdownFiles();
    allFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const file of allFiles) {
        const relativePath = normalizeRelativePath(file);
        const withoutExt = relativePath.replace(/\.mdx?$/, '');

        // Make sure we haven't already mapped this file AND it's not the homepage
        if (!usedFiles.has(relativePath) && !usedFiles.has(withoutExt) && relativePath !== config.homepage) {
            const slugParams = withoutExt === 'index' ? [] : withoutExt.split('/');
            if (slugParams[slugParams.length - 1] === 'index') {
                slugParams.pop();
            }
            const slugStr = slugParams.length === 0 ? '/' : '/' + slugParams.join('/');
            const doc = getDocBySlug(slugParams);
            const title = doc?.title || withoutExt;

            root.children.push({
                title: title,
                slug: slugStr,
                children: []
            });

            usedFiles.add(relativePath);
            usedFiles.add(withoutExt);
        }
    }

    return root;
});

export function buildSidebarTree(): DocTree {
    return buildSidebarTreeCached();
}

export type FlatDocLink = {
    title: string;
    slug: string;
    categoryTitle: string;
};

const getFlatDocLinksCached = cache((): FlatDocLink[] => {
    const tree = buildSidebarTreeCached();
    const links: FlatDocLink[] = [];

    for (const node of tree.children) {
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                if (child.slug) {
                    links.push({ title: child.title, slug: child.slug, categoryTitle: node.title });
                }
            }
            continue;
        }

        if (node.slug) {
            links.push({ title: node.title, slug: node.slug, categoryTitle: '' });
        }
    }

    return links;
});

export function getFlatDocLinks(): FlatDocLink[] {
    return getFlatDocLinksCached();
}
