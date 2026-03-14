# OpenDocs

OpenDocs is a lightweight Next.js documentation site for product docs, internal docs, or developer guides. Content lives in Markdown or MDX files inside `content/`, and navigation is driven by `content/config.json`.

## What This Project Is

This repo gives you a documentation app with:

- File-based docs from the `content/` folder
- Sidebar navigation configured in JSON
- Automatic page routing from file paths
- Markdown and MDX rendering
- A configurable footer call-to-action section
- A generated sitemap based on your docs pages

The app is built with Next.js, React, Tailwind CSS, and `next-mdx-remote`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

4. Optional: set a production site URL for sitemap generation:

```bash
$env:NEXT_PUBLIC_SITE_URL="https://docs.example.com"
```

## How Content Works

Docs are loaded from the `content/` directory.

- `content/index.md` becomes the homepage when `homepage` is set to `index.md`
- `content/guides/getting-started.md` becomes `/guides/getting-started`
- `content/guides/index.md` becomes `/guides`

The app supports `.md` and `.mdx` files.

If no homepage is configured, the app shows a setup screen at `/`.

## Navigation

Navigation is controlled by [content/config.json](/C:/Users/alexc/Documents/GitHub/OpenDocs/content/config.json).

Example:

```json
{
  "homepage": "index.md",
  "sidebar": [
    {
      "title": "Getting Started",
      "items": [
        "index.md",
        "guides/installation.md"
      ]
    },
    {
      "title": "Reference",
      "items": [
        "api/authentication.md",
        "api/webhooks.mdx"
      ]
    }
  ]
}
```

How it works:

- `homepage` points to the file that should render at `/`
- Each `sidebar` entry becomes a section in the left navigation
- Each path in `items` should match a file inside `content/`
- Files not listed in the sidebar can still be discovered and rendered, but listed items define the intended navigation order
- The order of items in `config.json` controls the sidebar order and the "Up next" card order

## Writing Pages

Create Markdown files under `content/` and add them to the sidebar config if you want them to appear in navigation.

Example page:

````md
# Installation

Install dependencies:

```bash
npm install
```

Then start the docs site locally.
````

## Footer Config

The footer CTA is also configured in [content/config.json](/C:/Users/alexc/Documents/GitHub/OpenDocs/content/config.json) under `contactSupport`.

Example:

```json
{
  "contactSupport": {
    "title": "Need help?",
    "description": "Contact our docs team if anything is unclear.",
    "buttonText": "Email us",
    "buttonLink": "mailto:docs@example.com"
  }
}
```

Fields:

- `title`: headline shown in the footer
- `description`: supporting text
- `buttonText`: button label
- `buttonLink`: destination URL, usually a `mailto:` link or help page URL

If you remove these values, the footer will render less content or disappear entirely.

## Useful Files

- [content/config.json](/C:/Users/alexc/Documents/GitHub/OpenDocs/content/config.json): homepage, sidebar, and footer settings
- [src/lib/docs.ts](/C:/Users/alexc/Documents/GitHub/OpenDocs/src/lib/docs.ts): file loading and sidebar tree generation
- [src/app/[[...slug]]/page.tsx](/C:/Users/alexc/Documents/GitHub/OpenDocs/src/app/[[...slug]]/page.tsx): page rendering and metadata
- [src/components/Sidebar.tsx](/C:/Users/alexc/Documents/GitHub/OpenDocs/src/components/Sidebar.tsx): sidebar UI
- [src/app/sitemap.ts](/C:/Users/alexc/Documents/GitHub/OpenDocs/src/app/sitemap.ts): sitemap generation
