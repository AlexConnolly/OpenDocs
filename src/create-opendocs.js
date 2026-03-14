#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const TEMPLATE_DIR = path.join(__dirname, "..", "template");
const TEXT_FILE_EXTENSIONS = new Set([
  ".css",
  ".gitignore",
  ".js",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
]);

function printUsage() {
  console.log(`Usage: create-opendocs <project-directory> [options]

Options:
  --site-name <name>         Override the visible docs/site name
  --description <text>       Override the site description
  --support-email <email>    Set the footer contact email
  --site-url <url>           Set NEXT_PUBLIC_SITE_URL in the starter content
  --no-install               Skip npm install in the generated project
  --force                    Allow copying into a non-empty directory
`);
}

function parseArgs(argv) {
  const options = {
    install: true,
    force: false,
  };
  let targetDir = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith("--")) {
      targetDir = targetDir || arg;
      continue;
    }

    if (arg === "--no-install") {
      options.install = false;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    const nextValue = argv[i + 1];
    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }

    if (arg === "--site-name") {
      options.siteName = nextValue;
    } else if (arg === "--description") {
      options.description = nextValue;
    } else if (arg === "--support-email") {
      options.supportEmail = nextValue;
    } else if (arg === "--site-url") {
      options.siteUrl = nextValue;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }

    i += 1;
  }

  return { options, targetDir };
}

function toTitleCase(value) {
  return value
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function toPackageName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "") || "my-docs";
}

function ensureEmptyTarget(targetPath, force) {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
    return;
  }

  const files = fs.readdirSync(targetPath);
  if (files.length === 0 || force) {
    return;
  }

  throw new Error(`Target directory is not empty: ${targetPath}`);
}

function copyDirectory(sourceDir, destinationDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true });
      copyDirectory(sourcePath, destinationPath);
      continue;
    }

    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function isTextFile(filePath) {
  const extension = path.extname(filePath);
  return TEXT_FILE_EXTENSIONS.has(extension) || path.basename(filePath) === ".gitignore";
}

function replaceTokensInDirectory(directoryPath, replacements) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      replaceTokensInDirectory(fullPath, replacements);
      continue;
    }

    if (!isTextFile(fullPath)) {
      continue;
    }

    let contents = fs.readFileSync(fullPath, "utf8");
    for (const [token, value] of Object.entries(replacements)) {
      contents = contents.split(token).join(value);
    }
    fs.writeFileSync(fullPath, contents);
  }
}

function runInstall(targetPath) {
  const result = spawnSync("npm", ["install"], {
    cwd: targetPath,
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    throw new Error("npm install failed");
  }
}

function main() {
  try {
    const { options, targetDir } = parseArgs(process.argv.slice(2));

    if (!targetDir) {
      printUsage();
      process.exit(1);
    }

    const targetPath = path.resolve(process.cwd(), targetDir);
    const projectDirectoryName = path.basename(targetPath);
    const projectName = toPackageName(projectDirectoryName);
    const siteName = options.siteName || toTitleCase(projectDirectoryName);
    const description = options.description || `${siteName} documentation`;
    const supportEmail = options.supportEmail || "support@example.com";
    const siteUrl = options.siteUrl || "https://docs.example.com";

    ensureEmptyTarget(targetPath, options.force);
    copyDirectory(TEMPLATE_DIR, targetPath);
    replaceTokensInDirectory(targetPath, {
      "__PROJECT_NAME__": projectName,
      "__SITE_NAME__": siteName,
      "__SITE_DESCRIPTION__": description,
      "__SUPPORT_EMAIL__": supportEmail,
      "__SITE_URL__": siteUrl,
    });

    if (options.install) {
      console.log(`Installing dependencies in ${targetPath}...`);
      runInstall(targetPath);
    }

    console.log("");
    console.log(`OpenDocs project created at ${targetPath}`);
    console.log("");
    console.log("Next steps:");
    console.log(`  cd ${targetDir}`);
    if (!options.install) {
      console.log("  npm install");
    }
    console.log("  npm run dev");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
