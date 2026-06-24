import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgSvg } from '@/lib/og';
import { svgToPng } from '@/lib/og-render';

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
  const png = svgToPng(svg);
  return new Response(Buffer.from(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
