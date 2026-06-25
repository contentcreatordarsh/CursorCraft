export type McpRisk = 'critical' | 'warning' | 'tip' | 'ok';

export interface McpServerView {
  name: string;
  transport: 'stdio' | 'url' | 'unknown';
  command?: string;
  args?: string[];
  url?: string;
  envKeys: string[];
  risks: { level: McpRisk; title: string; detail: string }[];
}

export interface McpAnalysis {
  valid: boolean;
  error?: string;
  servers: McpServerView[];
  summary: { critical: number; warning: number; tip: number };
}

function tryParse(raw: string): { ok: boolean; value?: unknown; error?: string } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, error: 'Invalid JSON — check braces, quotes, and trailing commas.' };
  }
}

function analyzeServer(name: string, cfg: Record<string, unknown>): McpServerView {
  const command = typeof cfg.command === 'string' ? cfg.command : undefined;
  const args = Array.isArray(cfg.args) ? cfg.args.map(String) : [];
  const url = typeof cfg.url === 'string' ? cfg.url : undefined;
  const env = (cfg.env ?? {}) as Record<string, unknown>;
  const envKeys = Object.keys(env);
  const joined = [command ?? '', ...args, url ?? '', ...envKeys.map((k) => `${k}=${env[k]}`)].join(' ');

  const transport: McpServerView['transport'] = url ? 'url' : command ? 'stdio' : 'unknown';
  const risks: McpServerView['risks'] = [];

  if (transport === 'unknown') {
    risks.push({
      level: 'warning',
      title: 'Unknown transport',
      detail: 'No command or url found — this server may not load.',
    });
  }

  if (url && /^http:\/\//i.test(url) && !/localhost|127\.0\.0\.1/i.test(url)) {
    risks.push({
      level: 'warning',
      title: 'Plain HTTP endpoint',
      detail: 'Traffic and tokens may be exposed on the network. Prefer HTTPS.',
    });
  }

  if (url && !/localhost|127\.0\.0\.1/i.test(url)) {
    risks.push({
      level: 'tip',
      title: 'Remote server',
      detail: 'Runs outside your machine — verify the operator and scope tokens narrowly.',
    });
  }

  const usesNpx = /\bnpx\b|\buvx\b/.test(joined);
  const hasPin = args.some((a) => /@\d+\.\d+/.test(a) || /@[0-9a-f]{7,40}$/.test(a));
  const usesLatest = args.some((a) => /@latest\b/.test(a));
  if ((usesNpx && !hasPin) || usesLatest) {
    risks.push({
      level: 'critical',
      title: 'Unpinned package source',
      detail: 'npx/uvx without a pinned version executes whatever is latest — supply-chain risk.',
    });
  }

  const broadFs =
    /(^|[\s"'=])(\/|~|\.\.\/|\/Users\/?$|\/home\/?$|C:\\\\?)(\s|"|'|$)/.test(joined) ||
    args.some((a) => a === '/' || a === '~' || a === 'C:\\');
  if (broadFs) {
    risks.push({
      level: 'warning',
      title: 'Broad filesystem scope',
      detail: 'Root or home directory access expands blast radius if the server is abused.',
    });
  }

  if (/(write|admin|root|--allow-write|readwrite|full[_-]?access)/i.test(joined)) {
    risks.push({
      level: 'warning',
      title: 'Write or admin scope',
      detail: 'Write-capable MCP servers can mutate external systems on your behalf.',
    });
  }

  if (/\b(curl|wget)\b[^|\n]*\|\s*(ba)?sh\b/i.test(joined)) {
    risks.push({
      level: 'critical',
      title: 'Pipe-to-shell pattern',
      detail: 'Remote code execution risk if this command runs.',
    });
  }

  if (/\b(sudo|docker\s+run)\b/i.test(joined)) {
    risks.push({
      level: 'warning',
      title: 'Privileged launcher',
      detail: 'sudo/docker in MCP launch commands increase impact of mistakes or injection.',
    });
  }

  if (/\bsk-[a-zA-Z0-9]{8,}\b/.test(joined) || /AKIA[0-9A-Z]{16}/.test(joined)) {
    risks.push({
      level: 'critical',
      title: 'Possible inline secret',
      detail: 'Move credentials to environment variables and rotate anything exposed.',
    });
  }

  if (risks.length === 0) {
    risks.push({ level: 'ok', title: 'No obvious issues', detail: 'Still review manually — automated checks are not exhaustive.' });
  }

  return { name, transport, command, args, url, envKeys, risks };
}

export function analyzeMcp(raw: string): McpAnalysis {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: 'Paste your mcp.json to visualize server scopes.', servers: [], summary: { critical: 0, warning: 0, tip: 0 } };
  }

  const parsed = tryParse(trimmed);
  if (!parsed.ok) {
    return { valid: false, error: parsed.error, servers: [], summary: { critical: 0, warning: 0, tip: 0 } };
  }

  const root = (parsed.value ?? {}) as Record<string, unknown>;
  const serversObj = (root.mcpServers ?? root.servers ?? {}) as Record<string, unknown>;
  const entries = Object.entries(serversObj);

  if (entries.length === 0) {
    return { valid: true, servers: [], summary: { critical: 0, warning: 0, tip: 0 } };
  }

  const servers = entries.map(([name, cfg]) => analyzeServer(name, (cfg ?? {}) as Record<string, unknown>));
  const summary = { critical: 0, warning: 0, tip: 0 };
  for (const s of servers) {
    for (const r of s.risks) {
      if (r.level === 'critical') summary.critical++;
      else if (r.level === 'warning') summary.warning++;
      else if (r.level === 'tip') summary.tip++;
    }
  }

  return { valid: true, servers, summary };
}
