import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const siteUrl = process.env.PUBLIC_SITE_URL || 'https://depute-junior-cm2.vercel.app';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
});
