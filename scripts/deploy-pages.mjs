#!/usr/bin/env node
// Publish the site to the repository root for GitHub Pages ("Deploy from a branch": main, / (root)),
// so it is served at https://aphiwemadlala.github.io/Durban-Luxe-/ with no /docs/ path or redirect.
//
// Safety: the site is built into .pages-build/ first. Only top-level names recorded in
// .pages-manifest.json (the previous publish) are removed from the root, and the deploy aborts if a
// generated name would collide with a source path. Source folders are never touched.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGE = '.pages-build';
const MANIFEST = path.join(ROOT, '.pages-manifest.json');
const BASE = process.env.BASE || '/Durban-Luxe-/';
const SITE_URL = process.env.SITE_URL || 'https://aphiwemadlala.github.io/Durban-Luxe-/';

const PROTECTED = new Set([
  '.git', '.github', '.gitignore', '.nojekyll', '.qa', STAGE, '.pages-manifest.json',
  'data', 'public', 'scripts', 'templates', 'reports', 'node_modules', 'dist', 'docs',
  'package.json', 'package-lock.json', 'DESIGN.md', 'PROJECT_CONTEXT.md', 'README.md',
]);

execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-site.mjs')], {
  stdio: 'inherit', env: { ...process.env, OUT_DIR: STAGE, BASE, SITE_URL },
});

// build-site.mjs emits its own .nojekyll; the root one is written below.
const generated = readdirSync(path.join(ROOT, STAGE)).filter((n) => n !== '.nojekyll');
const clash = generated.filter((n) => PROTECTED.has(n));
if (clash.length) throw new Error(`Refusing to publish: generated names collide with source paths: ${clash.join(', ')}`);

// Previous publish. The very first run replaces the old root redirect page (index.html).
const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')).entries : ['index.html'];
for (const name of previous) {
  if (PROTECTED.has(name)) continue;
  rmSync(path.join(ROOT, name), { recursive: true, force: true });
}
for (const name of generated) cpSync(path.join(ROOT, STAGE, name), path.join(ROOT, name), { recursive: true });
writeFileSync(path.join(ROOT, '.nojekyll'), '');
writeFileSync(MANIFEST, JSON.stringify({ base: BASE, siteUrl: SITE_URL, entries: generated.sort() }, null, 2) + '\n');
rmSync(path.join(ROOT, STAGE), { recursive: true, force: true });
console.log(`Published ${generated.length} top-level entries to the repo root for ${SITE_URL}`);
