import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://sckaviation.com';
  return [
    '', '/aircraft', '/atelier', '/projects', '/design-philosophy', '/journal', '/about', '/access',
  ].map((path) => ({ url: `${base}${path}`, changeFrequency: path === '/journal' ? 'weekly' : 'monthly', priority: path === '' ? 1 : 0.8 }));
}
