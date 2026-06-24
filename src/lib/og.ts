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

export function renderOgSvg({ title, eyebrow = SITE.name, subtitle }: OgOptions): string {
  const lines = wrap(title);
  const startY = 300 - (lines.length - 1) * 38;
  const titleTspans = lines
    .map(
      (l, i) =>
        `<tspan x="80" y="${startY + i * 76}">${escapeXml(l)}</tspan>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="'Geist Sans', system-ui, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0a0b"/>
      <stop offset="1" stop-color="#131316"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#8b8bff"/>
      <stop offset="1" stop-color="#2dd4bf"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g stroke="#34343b" stroke-width="1" opacity="0.25">
    ${Array.from({ length: 14 }, (_, i) => `<line x1="${i * 88}" y1="0" x2="${i * 88}" y2="630"/>`).join('')}
    ${Array.from({ length: 8 }, (_, i) => `<line x1="0" y1="${i * 88}" x2="1200" y2="${i * 88}"/>`).join('')}
  </g>
  <rect x="0" y="0" width="1200" height="6" fill="url(#accent)"/>
  <g transform="translate(80,90)">
    <rect width="44" height="44" rx="10" fill="#4f46e5"/>
    <text x="22" y="31" text-anchor="middle" font-family="'Geist Mono', monospace" font-size="24" font-weight="700" fill="#ffffff">&gt;</text>
    <text x="60" y="30" font-family="'Geist Mono', monospace" font-size="22" font-weight="600" fill="#fafafa">CursorCraft</text>
  </g>
  <text x="80" y="210" font-family="'Geist Mono', monospace" font-size="22" letter-spacing="4" fill="#8b8bff">${escapeXml(eyebrow.toUpperCase())}</text>
  <text font-size="64" font-weight="700" fill="#fafafa" letter-spacing="-1">${titleTspans}</text>
  ${
    subtitle
      ? `<text x="80" y="${startY + lines.length * 76 + 16}" font-size="26" fill="#a1a1aa">${escapeXml(subtitle.slice(0, 70))}</text>`
      : ''
  }
  <text x="80" y="560" font-family="'Geist Mono', monospace" font-size="20" fill="#71717a">Local-first · Your code &amp; keys never leave your browser · Open source</text>
</svg>`;
}
