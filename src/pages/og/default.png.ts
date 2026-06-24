import type { APIRoute } from 'astro';
import { renderOgSvg } from '@/lib/og';
import { svgToPng } from '@/lib/og-render';

export const GET: APIRoute = () => {
  const svg = renderOgSvg({
    title: 'Master Cursor. Secure it. Scale it.',
    eyebrow: 'Unofficial community guide',
    subtitle: 'Get maximum value from Cursor — without leaking code or burning budget.',
  });
  const png = svgToPng(svg);
  return new Response(Buffer.from(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
