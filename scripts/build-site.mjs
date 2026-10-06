import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const publishedFiles = [
  'index.html',
  'shared/portfolio.css',
  'shared/illustrated.css',
  'shared/polish.css',
  'shared/hero-layers.css',
  'shared/hero-layers.js',
  'shared/site-motion.css',
  'shared/site-motion.js',
  'shared/pointer-fx.css',
  'shared/pointer-fx.js',
  'shared/journey-layers.css',
  'shared/journey-layers.js',
  'shared/assets/favicon.svg',
  'shared/assets/sre-agent-robot-transparent.webp',
  'shared/assets/hero-layers/final/05-background-terrain.webp',
  'shared/assets/hero-layers/sun.webp',
  'shared/assets/hero-layers/final/04-city-trees.webp',
  'shared/assets/hero-layers/final/02-left-leaves.webp',
  'shared/assets/hero-layers/final/01-girl-cat.webp',
  'shared/assets/hero-layers/final/03-books.webp',
  'shared/assets/hero-layers/title.webp',
  'shared/assets/hero-layers/note_ideas.webp',
  'shared/assets/hero-layers/note_designer.webp',
  'shared/assets/journey-layers/final/03-background.webp',
  'shared/assets/journey-layers/final/01-girl-cat.webp',
  'shared/assets/journey-layers/final/02-foreground-leaves.webp',
  'shared/assets/journey-layers/final/text_left.webp',
  'shared/assets/journey-layers/final/text_right.webp',
  'shared/assets/yu-hd/02_about/about-portrait-static.webp',
  'projects/sre-agent/index.html',
  'projects/sre-agent/styles.css',
  'projects/sre-agent/script.js',
  'projects/sre-agent/assets/sre-home.jpg',
  'projects/knowme/index.html',
  'projects/knowme/assets/knowme-cloud-orange.webp',
  'projects/knowme/assets/knowme-brand-orange-custom.webp',
  'projects/knowme/assets/knowme-hero-login-phone.webp'
];

for (const entry of publishedFiles) {
  const target = join(dist, entry);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, entry), target);
}

// Fail the build if a page references a local file omitted from the list above.
for (const entry of publishedFiles.filter(file => file.endsWith('.html'))) {
  const page = join(dist, entry);
  const html = await readFile(page, 'utf8');
  for (const [, reference] of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) continue;
    const pathname = reference.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    const target = resolve(dirname(page), decodeURIComponent(pathname));
    if (target !== dist && !target.startsWith(dist + '/')) {
      throw new Error(`Reference outside dist: ${entry} → ${reference}`);
    }
    try {
      await stat(target);
    } catch {
      throw new Error(`Missing published file: ${entry} → ${reference}`);
    }
  }
}
