import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const publishedFiles = [
  'index.html',
  'shared/portfolio.css',
  'shared/illustrated.css',
  'shared/polish.css',
  'shared/assets/favicon.svg',
  'shared/assets/sre-agent-robot-transparent.png',
  'shared/assets/yu/01_hero/hero-art-static.png',
  'shared/assets/yu-hd/04_journey/journey-scene-next.png',
  'shared/assets/yu-hd/02_about/about-portrait-static.png',
  'projects/sre-agent/index.html',
  'projects/sre-agent/styles.css',
  'projects/sre-agent/script.js',
  'projects/sre-agent/assets/sre-home.jpg',
  'projects/knowme/index.html',
  'projects/knowme/assets/knowme-cloud-orange.png',
  'projects/knowme/assets/knowme-brand-orange-custom.png',
  'projects/knowme/assets/knowme-hero-login-phone.png'
];

for (const entry of publishedFiles) {
  const target = join(dist, entry);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, entry), target);
}
