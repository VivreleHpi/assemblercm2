import type { APIRoute } from 'astro';
import { ETAPES } from '../data';

export const GET: APIRoute = () => {
  const baseUrl = 'https://assemblee-cm2-malik.netlify.app';
  const staticUrls = ['/', '/enseignants/', '/glossaire/', '/credits/', '/styleguide/'];
  const stepUrls = ETAPES.map((e) => `/etape/${e.slug}/`);
  const allUrls = [...staticUrls, ...stepUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u}</loc>
    <changefreq>monthly</changefreq>
    <priority>${u === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};

