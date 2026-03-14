# create-opendocs

`create-opendocs` scaffolds a new OpenDocs-powered documentation site.

## Quick Start

Create a new docs site with `npx`:

```bash
npx create-opendocs my-docs
```

Then run it locally:

```bash
cd my-docs
npm run dev
```

Create a project with custom defaults:

```bash
npx create-opendocs my-docs --site-name "My Docs" --support-email docs@example.com --site-url https://docs.example.com
```

## What It Creates

The generated project is a Next.js docs app with:

- File-based content in `content/`
- Sidebar navigation configured in `content/config.json`
- Markdown and MDX page support
- A footer CTA block driven by config
- Static page generation and sitemap support

The generated project includes starter docs content, sidebar configuration, and a working homepage out of the box.

## Options

- `--site-name <name>`: visible docs/site name
- `--description <text>`: metadata description
- `--support-email <email>`: footer support email
- `--site-url <url>`: default public site URL used by the starter
- `--no-install`: skip `npm install`
- `--force`: allow copying into a non-empty directory

## Generated Project

After scaffolding, the generated app is a normal Next.js project. The main files you’ll edit are:

- `content/config.json`: homepage, sidebar, and footer settings
- `content/`: Markdown and MDX docs content
- `src/app/`: app shell and page routes
- `src/lib/docs.ts`: docs loading and sidebar generation

## Repository Layout

- `src/create-opendocs.js`: the CLI entrypoint
- `template/`: the Next.js starter app that gets copied into new projects

## Local Development

Dry-run the published package contents:

```bash
npm run pack:dry-run
```

Install and validate the template app:

```bash
npm run template:install
npm run template:lint
npm run template:build
```

## Publishing

When you're ready to publish:

```bash
npm publish --access public
```

Before publishing, it's worth running:

```bash
npm run pack:dry-run
```
