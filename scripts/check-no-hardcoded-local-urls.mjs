import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const rootsToScan = [
  "apps",
  "packages",
  "docker-compose.yaml",
  "docker-compose.yml",
  "Dockerfile",
  "scripts",
];

const ignoredPathFragments = [
  "node_modules",
  "dist",
  "build",
  "out",
  ".next",
  ".vite",
  "coverage",
  ".turbo",
  ".git",
  ".cache",
  ".output",
];

const allowedPathFragments = [
  ".env.example",
  "README.md",
  "docs",
  "packages/config/src/defaults.ts",
  "packages/config/src/env-names.ts",
  "scripts/check-no-hardcoded-local-urls.mjs",
];

const allowedExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".yaml",
  ".yml",
  ".env",
  ".example",
  ".md",
  ".dockerfile",
]);

const forbiddenPatterns = [
  /https?:\/\/localhost(?::\d+)?/g,
  /localhost:\d+/g,
  /127\.0\.0\.1:\d+/g,
  /\bEXPOSE\s+(3000|4000|5173)\b/g,
  /\b(port|PORT):\s*(3000|4000|5173)\b/g,
];

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function shouldIgnore(filePath) {
  const normalizedPath = normalizePath(filePath);

  return ignoredPathFragments.some((fragment) => normalizedPath.includes(`/${fragment}/`));
}

function isAllowed(filePath) {
  const normalizedPath = normalizePath(filePath);

  return allowedPathFragments.some((fragment) => normalizedPath.includes(fragment));
}

function shouldScanFile(filePath) {
  const normalizedPath = normalizePath(filePath);

  if (shouldIgnore(normalizedPath)) {
    return false;
  }

  if (isAllowed(normalizedPath)) {
    return false;
  }

  const basename = path.basename(filePath);
  const extension = path.extname(filePath).toLowerCase();

  if (basename === "Dockerfile") {
    return true;
  }

  if (basename.startsWith(".env")) {
    return true;
  }

  return allowedExtensions.has(extension);
}

function collectFiles(entryPath) {
  const files = [];

  let stats;

  try {
    stats = statSync(entryPath);
  } catch {
    return files;
  }

  if (stats.isFile()) {
    if (shouldScanFile(entryPath)) {
      files.push(entryPath);
    }

    return files;
  }

  if (!stats.isDirectory() || shouldIgnore(entryPath)) {
    return files;
  }

  for (const child of readdirSync(entryPath)) {
    files.push(...collectFiles(path.join(entryPath, child)));
  }

  return files;
}

const violations = [];

for (const root of rootsToScan) {
  for (const filePath of collectFiles(root)) {
    const content = readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    for (const [index, line] of lines.entries()) {
      for (const pattern of forbiddenPatterns) {
        pattern.lastIndex = 0;

        if (pattern.test(line)) {
          violations.push({
            filePath: normalizePath(filePath),
            lineNumber: index + 1,
            line: line.trim(),
          });
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Hardcoded local URLs or ports found outside allowed files:");
  console.error("");

  for (const violation of violations) {
    console.error(`${violation.filePath}:${violation.lineNumber}: ${violation.line}`);
  }

  console.error("");
  console.error(
    "Move local URLs/ports into @appkit/config defaults, root .env.example, or an allowed docs file.",
  );

  process.exit(1);
}
