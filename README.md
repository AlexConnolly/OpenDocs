# create-opendocs

`create-opendocs` scaffolds a new OpenDocs-powered documentation site.

## What It Creates

The generated project is a Next.js docs app with:

- File-based content in `content/`
- Sidebar navigation configured in `content/config.json`
- Markdown and MDX page support
- A footer CTA block driven by config
- Static page generation and sitemap support

## Usage

Create a new project:

```bash
npx create-opendocs my-docs
```

Create a project with custom defaults:

```bash
npx create-opendocs my-docs --site-name "My Docs" --support-email docs@example.com --site-url https://docs.example.com
```

## Options

- `--site-name <name>`: visible docs/site name
- `--description <text>`: metadata description
- `--support-email <email>`: footer support email
- `--site-url <url>`: default public site URL used by the starter
- `--no-install`: skip `npm install`
- `--force`: allow copying into a non-empty directory

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
