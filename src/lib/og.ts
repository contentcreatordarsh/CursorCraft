import { SITE } from '@/config/site';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Naive width-aware wrapper for the big OG title. */
function wrap(text: string, max = 26): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

export interface OgOptions {
  title: string;
  eyebrow?: string;
  subtitle?: string;
}

/** Cursor-native neutral OG card — no purple/cyan gradients. */
export function renderOgSvg({ title, eyebrow = SITE.name, subtitle }: OgOptions): string {
  const lines = wrap(title);
  const startY = 300 - (lines.length - 1) * 38;
  const titleTspans = lines
    .map((l, i) => `<tspan x="80" y="${startY + i * 76}">${escapeXml(l)}</tspan>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="'Geist', system-ui, sans-serif">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <rect x="48" y="48" width="1104" height="534" rx="12" stroke="rgba(255,255,255,0.08)" stroke-width="1" fill="#0f0f0f"/>
  <g transform="translate(80,90)">
    <rect width="44" height="44" rx="8" fill="#141414" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="22" y="31" text-anchor="middle" font-family="'Geist Mono', monospace" font-size="22" font-weight="600" fill="#f5f5f5">&gt;</text>
    <text x="60" y="30" font-family="'Geist Mono', monospace" font-size="22" font-weight="500" fill="#fafafa">CursorCraft</text>
  </g>
  <text x="80" y="210" font-family="'Geist Mono', monospace" font-size="18" fill="#737373">${escapeXml(eyebrow)}</text>
  <text font-size="58" font-weight="700" fill="#fafafa" letter-spacing="-1">${titleTspans}</text>
  ${
    subtitle
      ? `<text x="80" y="${startY + lines.length * 76 + 16}" font-size="24" fill="#a3a3a3">${escapeXml(subtitle.slice(0, 70))}</text>`
      : ''
  }
  <text x="80" y="560" font-family="'Geist Mono', monospace" font-size="18" fill="#525252">Local-first · Your code &amp; keys never leave your browser</text>
</svg>`;
}
