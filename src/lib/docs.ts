import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Using a standard Next.js path from process.cwd()
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

export function getConfig(): DocsConfig {
    const configPath = path.join(DOCS_DIRECTORY, 'config.json');
    if (fs.existsSync(configPath)) {
        try {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (e) {
            console.error("Failed to parse config.json", e);
        }
    }
    return { sidebar: [] };
}

// Ensure the docs directory exists
function ensureDocsDirectory() {
    if (!fs.existsSync(DOCS_DIRECTORY)) {
        fs.mkdirSync(DOCS_DIRECTORY, { recursive: true });

        fs.writeFileSync(
            path.join(DOCS_DIRECTORY, 'index.md'),
            `# Welcome to OpenDocs\n\nOpenDocs is a flexible documentation starter for products, teams, and internal tools.\n\n### Start here\n\n- Add your homepage content\n- Create sections in the sidebar\n- Publish your documentation\n`
        );

        const featuresPath = path.join(DOCS_DIRECTORY, 'features');
        fs.mkdirSync(featuresPath);
        fs.writeFileSync(
            path.join(featuresPath, 'analytics.md'),
            `# Example Page\n\nUse this page as a starting point for your own documentation.\n`
        );

        const initialConfig: DocsConfig = {
            homepage: "index.md",
            sidebar: [
                {
                    title: "Welcome",
                    items: ["index.md"]
                },
                {
                    title: "Features",
                    items: ["features/analytics.md"]
                }
            ],
            contactSupport: {
                title: "Was this helpful?",
                description: "Reach out to support if you need assistance or are stuck.",
                buttonText: "Contact Support",
                buttonLink: "mailto:support@example.com"
            }
        };
        fs.writeFileSync(
            path.join(DOCS_DIRECTORY, 'config.json'),
            JSON.stringify(initialConfig, null, 2)
        );
    }
}

// Recursively find all markdown files
function getAllMarkdownFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;

    const files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllMarkdownFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.md') || file.endsWith('.mdx')) {
                arrayOfFiles.push(path.join(dirPath, file));
            }
        }
    });

    return arrayOfFiles;
}

export function getAllDocsSlugs(): string[][] {
    ensureDocsDirectory();
    const config = getConfig();
    const files = getAllMarkdownFiles(DOCS_DIRECTORY);
    const slugs: string[][] = [];

    files.forEach(file => {
        const relativePath = file.replace(DOCS_DIRECTORY + '/', '');

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
}

export function getDocBySlug(slugParams: string[] = []): DocItem | null {
    ensureDocsDirectory();
    const config = getConfig();

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
}

export function buildSidebarTree(): DocTree {
    ensureDocsDirectory();
    const config = getConfig();
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

    const allFiles = getAllMarkdownFiles(DOCS_DIRECTORY);
    allFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const file of allFiles) {
        const relativePath = file.replace(DOCS_DIRECTORY + '/', '');
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
}
