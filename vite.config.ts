import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// Replaces %SITE_URL% in index.html so social previews get absolute image URLs.
// Uses SITE_URL when set, otherwise the production domain Vercel exposes at build time.
function siteUrlPlugin(): Plugin {
  const host = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
  const siteUrl = host.replace(/\/+$/, '');
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
  };
}

export default defineConfig(() => {
  return {
    plugins: [siteUrlPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Set DISABLE_HMR=true to turn off hot reload and file watching.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
