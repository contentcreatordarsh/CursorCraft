/** Store-only ZIP builder — no compression, no dependencies. */

const encoder = new TextEncoder();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]!;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n: number): number[] {
  return [n & 0xff, (n >>> 8) & 0xff];
}

function u32(n: number): number[] {
  return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
}

export interface ZipEntry {
  name: string;
  content: string;
}

/** Build a ZIP archive Blob from UTF-8 text files. */
export function createZipBlob(files: ZipEntry[]): Blob {
  const parts: number[] = [];
  const central: number[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    const checksum = crc32(data);
    const localHeader = [
      0x50, 0x4b, 0x03, 0x04, // local file header
      20,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      ...u32(checksum),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(nameBytes.length),
      0,
      ...nameBytes,
      ...data,
    ];
    parts.push(...localHeader);

    const centralHeader = [
      0x50, 0x4b, 0x01, 0x02,
      20,
      0,
      20,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      ...u32(checksum),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(nameBytes.length),
      0,
      0,
      0,
      0,
      0,
      0,
      ...u32(offset),
      ...nameBytes,
    ];
    central.push(...centralHeader);
    offset += localHeader.length;
  }

  const centralStart = parts.length;
  parts.push(...central);
  const centralSize = parts.length - centralStart;
  parts.push(
    0x50,
    0x4b,
    0x05,
    0x06,
    0,
    0,
    0,
    0,
    ...u16(files.length),
    ...u16(files.length),
    ...u32(centralSize),
    ...u32(centralStart),
    0,
    0,
  );

  return new Blob([new Uint8Array(parts)], { type: 'application/zip' });
}

export function downloadZip(files: ZipEntry[], filename: string): void {
  const blob = createZipBlob(files);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
