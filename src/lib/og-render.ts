import { Resvg } from '@resvg/resvg-js';
import { join } from 'node:path';

// OG endpoints are static-rendered at build time, so the project root (cwd)
// reliably points at the source tree where the brand fonts live.
const fontDir = join(process.cwd(), 'src/og-fonts');
const fontFiles = [
  'geist-sans-latin-400-normal.ttf',
  'geist-sans-latin-600-normal.ttf',
  'geist-sans-latin-700-normal.ttf',
  'geist-mono-latin-400-normal.ttf',
].map((name) => join(fontDir, name));

/** Rasterize an OG SVG string to a 1200px-wide PNG buffer using the Geist fonts. */
export function svgToPng(svg: string): Uint8Array {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      fontFiles,
      defaultFontFamily: 'Geist',
      loadSystemFonts: false,
    },
  });
  return resvg.render().asPng();
}
