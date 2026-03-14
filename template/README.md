# __SITE_NAME__

__SITE_NAME__ is a lightweight Next.js documentation site powered by OpenDocs.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

4. Optional: set your production site URL for sitemap generation:

```bash
$env:NEXT_PUBLIC_SITE_URL="__SITE_URL__"
```

## What The Project Does

- Loads docs from the `content/` folder
- Builds the sidebar from `content/config.json`
- Renders Markdown and MDX pages automatically from file paths
- Shows an optional footer CTA from config
- Generates a sitemap from your docs pages

## Navigation

Navigation is configured in `content/config.json`.

Example:

```json
{
  "homepage": "index.md",
  "sidebar": [
    {
      "title": "Getting Started",
      "items": [
        "index.md",
        "guides/getting-started.md"
      ]
    }
  ]
}
```

How it works:

- `homepage` controls which file renders at `/`
- each `sidebar` group becomes a visible section in the left navigation
- each `items` entry should point to a file inside `content/`
- sidebar order also controls the "Up next" order at the bottom of pages

## Footer Config

The footer CTA lives under `contactSupport` in `content/config.json`.

Example:

```json
{
  "contactSupport": {
    "title": "Need help?",
    "description": "Contact the docs team if anything is unclear.",
    "buttonText": "Email us",
    "buttonLink": "mailto:docs@example.com"
  }
}
```

## Useful Files

- `content/config.json`: homepage, sidebar, and footer configuration
- `content/index.md`: homepage content
- `src/lib/docs.ts`: file loading and sidebar generation
- `src/app/[[...slug]]/page.tsx`: page rendering and metadata
- `src/components/Sidebar.tsx`: sidebar UI
