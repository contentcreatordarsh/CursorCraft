import type { AuditRule, Finding, Severity } from './types';

const nonEmpty = (s?: string): s is string => typeof s === 'string' && s.trim().length > 0;

/** Parse JSON loosely; returns undefined on failure (we report separately). */
function tryParse(raw?: string): { ok: boolean; value?: unknown } {
  if (!nonEmpty(raw)) return { ok: false };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
}

/* ------------------------------------------------------------------ */
/* Secret detection (used across rules)                                */
/* ------------------------------------------------------------------ */

interface SecretPattern {
  label: string;
  re: RegExp;
}

export const SECRET_PATTERNS: SecretPattern[] = [
  { label: 'OpenAI-style key', re: /\bsk-[a-zA-Z0-9]{16,}\b/ },
  { label: 'Anthropic key', re: /\bsk-ant-[a-zA-Z0-9_-]{16,}\b/ },
  { label: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/ },
  { label: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{30,}\b/ },
  { label: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { label: 'Stripe live key', re: /\b[rs]k_live_[0-9a-zA-Z]{16,}\b/ },
  { label: 'Private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { label: 'JWT', re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { label: 'Generic assigned secret', re: /\b(?:api[_-]?key|secret|password|token|passwd)\b\s*[:=]\s*['"][^'"\s]{8,}['"]/i },
];

function detectSecrets(text: string): string[] {
  const hits = new Set<string>();
  for (const p of SECRET_PATTERNS) {
    if (p.re.test(text)) hits.add(p.label);
  }
  return [...hits];
}

const f = (
  id: string,
  severity: Severity,
  title: string,
  explanation: string,
  fix: string,
  source: Finding['source'],
): Finding => ({ id, severity, title, explanation, fix, source });

/* ------------------------------------------------------------------ */
/* Rules                                                              */
/* ------------------------------------------------------------------ */

const SECRET_IGNORE_TARGETS: { token: string; matches: RegExp; label: string }[] = [
  { token: '.env', matches: /(^|\/)\.env\b/m, label: '.env files' },
  { token: '*.key', matches: /\*\.key\b/m, label: 'private key files (*.key)' },
  { token: '*.pem', matches: /\*\.pem\b/m, label: 'certificate/key files (*.pem)' },
  { token: 'secrets', matches: /secrets?\//im, label: 'secrets/ directories' },
  { token: 'credentials', matches: /credential/im, label: 'credentials' },
];

export const rules: AuditRule[] = [
  /* 1. .cursorignore presence + secret coverage */
  {
    id: 'cursorignore',
    run: (input) => {
      const out: Finding[] = [];
      if (!nonEmpty(input.cursorignore)) {
        out.push(
          f(
            'cursorignore-missing',
            'critical',
            'No .cursorignore provided',
            'Without a .cursorignore, Cursor can index and send sensitive files — .env, keys, credentials — to the model as context. This is the most common way secrets leak into AI tooling.',
            'Add a .cursorignore at your repo root that excludes secrets and noise. Start with: .env, .env.*, *.key, *.pem, secrets/, credentials/, node_modules/, dist/.',
            'cursorignore',
          ),
        );
        return out;
      }

      const content = input.cursorignore;
      for (const t of SECRET_IGNORE_TARGETS) {
        if (!t.matches.test(content)) {
          out.push(
            f(
              `cursorignore-missing-${t.token}`,
              'warning',
              `.cursorignore may not cover ${t.label}`,
              `Your .cursorignore does not appear to exclude ${t.label}. If such files exist in the repo, Cursor could feed their contents to the model.`,
              `Add a pattern for ${t.label} — e.g. \`${t.token}\` — to your .cursorignore.`,
              'cursorignore',
            ),
          );
        }
      }

      if (!/node_modules\//m.test(content)) {
        out.push(
          f(
            'cursorignore-node-modules',
            'tip',
            'Consider ignoring node_modules/',
            'node_modules/ is large and low-signal. Indexing it wastes context budget (and money) without improving results.',
            'Add `node_modules/` (and build output like `dist/`) to your .cursorignore.',
            'cursorignore',
          ),
        );
      }
      return out;
    },
  },

  /* 2. .cursor/rules presence + quality */
  {
    id: 'rules',
    run: (input) => {
      const out: Finding[] = [];
      if (!nonEmpty(input.rules)) {
        out.push(
          f(
            'rules-missing',
            'warning',
            'No project rules provided',
            'Without .cursor/rules (or .cursorrules), you repeat conventions in every prompt and the AI has no persistent guardrails. Rules are how you encode architecture, style, and security constraints once.',
            'Create .cursor/rules with a few sharp, testable conventions — including at least one security guardrail (e.g. "new endpoints must include an authorization check").',
            'rules',
          ),
        );
        return out;
      }

      const content = input.rules;
      const wordCount = content.trim().split(/\s+/).length;
      if (wordCount < 15) {
        out.push(
          f(
            'rules-trivial',
            'warning',
            'Project rules look trivial',
            'A nearly-empty rules file provides little guidance. The AI falls back to generic behavior and ignores your conventions.',
            'Expand your rules with concrete conventions and constraints the model can follow on every interaction.',
            'rules',
          ),
        );
      }

      const hasSecurity = /(security|auth|secret|privacy|permission|vulnerab|sanitiz|validate)/i.test(
        content,
      );
      if (!hasSecurity) {
        out.push(
          f(
            'rules-no-security',
            'tip',
            'Rules contain no security guidance',
            'Encoding security expectations in rules nudges the AI toward safe defaults — checking auth, validating input, never logging secrets.',
            'Add a security guardrail to your rules, e.g. "Never call external services with user secrets" or "All new endpoints require an authorization check".',
            'rules',
          ),
        );
      }

      const secrets = detectSecrets(content);
      if (secrets.length > 0) {
        out.push(
          f(
            'rules-secret-leak',
            'critical',
            'Possible secret pasted into rules',
            `Your rules appear to contain a credential (${secrets.join(', ')}). Rules are shared context — anything here is exposed to the model and to anyone with repo access.`,
            'Remove the secret immediately and rotate it. Reference secrets via environment variables; never hard-code them in rules or settings.',
            'rules',
          ),
        );
      }
      return out;
    },
  },

  /* 3. mcp.json — trust, pinning, scope, least-privilege */
  {
    id: 'mcp',
    run: (input) => {
      const out: Finding[] = [];
      if (!nonEmpty(input.mcp)) return out;

      const parsed = tryParse(input.mcp);
      if (!parsed.ok) {
        out.push(
          f(
            'mcp-invalid',
            'warning',
            'mcp.json is not valid JSON',
            'The MCP config could not be parsed, so it may not load as intended — or it was pasted incompletely.',
            'Validate the JSON (matching braces, quoted keys, no trailing commas).',
            'mcp',
          ),
        );
        return out;
      }

      const root = (parsed.value ?? {}) as Record<string, unknown>;
      const servers = (root.mcpServers ?? root.servers ?? {}) as Record<string, unknown>;
      const entries = Object.entries(servers);

      if (entries.length === 0) {
        out.push(
          f(
            'mcp-empty',
            'tip',
            'No MCP servers defined',
            'No servers were found under "mcpServers". If that is intentional, great — fewer integrations means a smaller attack surface.',
            'No action needed unless you expected servers here.',
            'mcp',
          ),
        );
        return out;
      }

      const raw = input.mcp;

      const secrets = detectSecrets(raw);
      if (secrets.length > 0) {
        out.push(
          f(
            'mcp-secret-leak',
            'critical',
            'Possible secret in mcp.json',
            `The MCP config appears to contain a credential (${secrets.join(', ')}). Hard-coded tokens in mcp.json are easy to leak via commits or sharing.`,
            'Move the value to an environment variable and reference it; rotate the exposed credential.',
            'mcp',
          ),
        );
      }

      for (const [name, cfgUnknown] of entries) {
        const cfg = (cfgUnknown ?? {}) as Record<string, unknown>;
        const args = Array.isArray(cfg.args) ? (cfg.args as unknown[]).map(String) : [];
        const command = typeof cfg.command === 'string' ? cfg.command : '';
        const joined = [command, ...args].join(' ');

        // Unpinned source (npx without a version, or "latest")
        const usesNpx = /\bnpx\b/.test(joined) || /\buvx\b/.test(joined);
        const hasPin = args.some((a) => /@\d+\.\d+/.test(a) || /@[0-9a-f]{7,40}$/.test(a));
        const usesLatest = args.some((a) => /@latest\b/.test(a));
        if ((usesNpx && !hasPin) || usesLatest) {
          out.push(
            f(
              `mcp-unpinned-${name}`,
              'critical',
              `MCP server "${name}" runs an unpinned source`,
              'Running an MCP server via npx/uvx without a pinned version (or with @latest) means you execute whatever the latest published code is — a supply-chain risk. A malicious update would run with your privileges.',
              `Pin "${name}" to a specific, audited version (e.g. package@1.4.2) from a source you trust.`,
              'mcp',
            ),
          );
        }

        // Broad filesystem scope
        const broadFs = /(^|[\s"'=])(\/|~|\.\.\/|\/Users\/?$|\/home\/?$|C:\\\\?)(\s|"|'|$)/.test(
          joined,
        );
        const rootFsArg = args.some((a) => a === '/' || a === '~' || a === 'C:\\');
        if (broadFs || rootFsArg) {
          out.push(
            f(
              `mcp-broad-fs-${name}`,
              'warning',
              `MCP server "${name}" may have a broad filesystem scope`,
              'A filesystem server rooted at /, ~, or a home directory exposes far more than the project. If the server is compromised or hijacked via prompt injection, the blast radius is your whole machine.',
              `Scope "${name}" to the narrowest directory it needs — ideally the project subfolder, not the filesystem root.`,
              'mcp',
            ),
          );
        }

        // Write / admin hints
        const env = (cfg.env ?? {}) as Record<string, unknown>;
        const envJoined = Object.entries(env)
          .map(([k, v]) => `${k}=${String(v)}`)
          .join(' ');
        const writeHint = /(write|admin|root|--allow-write|readwrite|full[_-]?access)/i.test(
          `${joined} ${envJoined}`,
        );
        if (writeHint) {
          out.push(
            f(
              `mcp-write-${name}`,
              'warning',
              `MCP server "${name}" may have write/admin privileges`,
              'Write or admin scopes let the agent mutate external systems. Combined with untrusted input, that is how automated mistakes become destructive.',
              `Grant "${name}" read-only access unless write is essential; use a scoped, least-privilege token.`,
              'mcp',
            ),
          );
        }
      }

      out.push(
        f(
          'mcp-least-privilege',
          'tip',
          'Review every MCP server for least-privilege',
          'Each MCP server is a privilege boundary that can read inputs and act on your behalf. Even trusted servers should run with the narrowest scope and token that works.',
          'For each server, ask: does it need write access? The whole filesystem? An admin token? Trim each to the minimum.',
          'mcp',
        ),
      );

      return out;
    },
  },

  /* 4. settings.json — privacy mode + cost defaults */
  {
    id: 'settings',
    run: (input) => {
      const out: Finding[] = [];
      if (!nonEmpty(input.settings)) return out;

      const raw = input.settings;
      const parsed = tryParse(raw);
      const obj = parsed.ok ? (parsed.value as Record<string, unknown>) : null;

      // Privacy mode disabled detection (across a few plausible key shapes)
      const privacyDisabled =
        /"(?:privacyMode|cursor\.privacyMode|privacy)"\s*:\s*(?:false|"(?:off|disabled)")/i.test(
          raw,
        ) || obj?.['privacyMode'] === false;
      if (privacyDisabled) {
        out.push(
          f(
            'settings-privacy-off',
            'critical',
            'Privacy Mode appears to be disabled',
            'With Privacy Mode off, your code may be retained or used for training. For proprietary or regulated code this is usually unacceptable, and it should be enforced as org policy rather than left to individuals.',
            'Enable Privacy Mode, and enforce it organization-wide so a new hire\u2019s default is safe.',
            'settings',
          ),
        );
      }

      const secrets = detectSecrets(raw);
      if (secrets.length > 0) {
        out.push(
          f(
            'settings-secret-leak',
            'critical',
            'Possible secret in settings',
            `Your settings appear to contain a credential (${secrets.join(', ')}). Settings are easily shared and synced; secrets here leak easily.`,
            'Remove and rotate the secret; use environment variables or a secret manager instead.',
            'settings',
          ),
        );
      }

      // Cost: expensive default model
      const expensiveDefault =
        /"(?:model|defaultModel|cursor\.defaultModel)"\s*:\s*"[^"]*(?:max|opus|gpt-4|o1|frontier)[^"]*"/i.test(
          raw,
        );
      if (expensiveDefault) {
        out.push(
          f(
            'settings-expensive-model',
            'tip',
            'Default model may be an expensive choice',
            'Defaulting every request to a frontier or Max-tier model drives cost up fast. Most everyday work is handled well by the cheaper Auto/Composer pool.',
            'Default to Auto/Composer and escalate to a frontier model per-task only when the cheaper option actually fails.',
            'settings',
          ),
        );
      } else {
        out.push(
          f(
            'settings-model-tip',
            'tip',
            'Default to Auto/Composer for cost',
            'The first-party Auto/Composer pool is the cheaper, well-tuned default for most work.',
            'Set Auto as the team default and reserve Max-style modes for genuinely hard reasoning.',
            'settings',
          ),
        );
      }
      return out;
    },
  },

  /* 5. General secret sweep across all provided files (catch-all) */
  {
    id: 'general-secrets',
    run: (input) => {
      const out: Finding[] = [];
      const combined = [input.cursorignore, input.rules, input.mcp, input.settings]
        .filter(nonEmpty)
        .join('\n');
      // Only emit a general note when no file-specific secret finding will fire,
      // i.e. secrets appear only in .cursorignore (unusual) — keep it as a safety net.
      if (nonEmpty(input.cursorignore)) {
        const hits = detectSecrets(input.cursorignore);
        if (hits.length > 0) {
          out.push(
            f(
              'cursorignore-secret-leak',
              'critical',
              'Possible secret in .cursorignore',
              `Your .cursorignore appears to contain a credential (${hits.join(', ')}). A .cursorignore should list patterns, never literal secret values.`,
              'Remove the literal secret; .cursorignore should only contain glob patterns. Rotate the exposed credential.',
              'cursorignore',
            ),
          );
        }
      }
      // Touch combined so linexplicit intent is clear; not otherwise used.
      void combined;
      return out;
    },
  },
];

export function detectSecretsIn(text: string): string[] {
  return detectSecrets(text);
}
