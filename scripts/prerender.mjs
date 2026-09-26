// Renders the public views to HTML at build time (index.html, rooms.html, booking.html), so the content is in the
// initial HTML for search engines, link previews and no-JS visitors. The browser then hydrates it.
// The admin view is not prerendered; it renders client-side.
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const distDir = path.resolve('dist');
const ssrDir = path.resolve('dist-ssr');
const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
const placeholder = '<div id="root"><!--app-html--></div>';

if (!template.includes(placeholder)) {
  console.error(`prerender: ${placeholder} not found in dist/index.html`);
  process.exit(1);
}

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

for (const [view, file] of [['home', 'index.html'], ['rooms', 'rooms.html'], ['booking', 'booking.html']]) {
  const html = render(view);
  fs.writeFileSync(path.join(distDir, file), template.replace(placeholder, () => `<div id="root" data-view="${view}">${html}</div>`));
  console.log(`prerender: ${file} (${html.length} characters)`);
}

fs.rmSync(ssrDir, { recursive: true, force: true });
