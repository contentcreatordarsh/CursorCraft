import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgSvg } from '@/lib/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const guides = await getCollection('guides');
  return guides.map((guide) => ({
    params: { slug: guide.id },
    props: { title: guide.data.title, eyebrow: guide.data.eyebrow },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { title, eyebrow } = props as { title: string; eyebrow: string };
  const svg = renderOgSvg({ title, eyebrow: `${eyebrow} guide` });
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
