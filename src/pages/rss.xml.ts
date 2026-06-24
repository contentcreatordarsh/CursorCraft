import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '@/config/site';

export async function GET(context: APIContext) {
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  return rss({
    title: `${SITE.name} — the Cursor playbook`,
    description: SITE.shortDescription,
    site: context.site ?? SITE.url,
    items: guides.map((guide) => ({
      title: guide.data.title,
      description: guide.data.description,
      link: `/learn/${guide.id}`,
      pubDate: new Date(guide.data.updated),
      categories: guide.data.keywords,
    })),
    customData: '<language>en-us</language>',
    stylesheet: false,
  });
}
