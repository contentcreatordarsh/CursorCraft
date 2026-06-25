import { detectSecretsIn } from '../analyzer/rules.ts';

export type LintSeverity = 'error' | 'warning' | 'tip';

export interface LintIssue {
  id: string;
  severity: LintSeverity;
  title: string;
  detail: string;
  line?: number;
}

function issue(
  id: string,
  severity: LintSeverity,
  title: string,
  detail: string,
  line?: number,
): LintIssue {
  return { id, severity, title, detail, line };
}

function parseFrontmatter(content: string): { frontmatter: string; body: string; lineCount: number } | null {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/m.exec(content);
  if (!match) return null;
  return { frontmatter: match[1]!, body: match[2]!, lineCount: match[1]!.split('\n').length + 2 };
}

function frontmatterValue(fm: string, key: string): string | undefined {
  const re = new RegExp(`^${key}:\\s*(.+)$`, 'im');
  const m = re.exec(fm);
  return m?.[1]?.trim();
}

/** Lint a single .mdc or rules file. */
export function lintMdc(content: string, filename = 'rules.mdc'): LintIssue[] {
  const out: LintIssue[] = [];
  if (!content.trim()) {
    out.push(issue('empty', 'error', 'Empty rules file', 'Rules file has no content.'));
    return out;
  }

  const parsed = parseFrontmatter(content);
  const looksLikeMdc = /\.mdc\b/i.test(filename) || content.includes('alwaysApply');

  if (looksLikeMdc && !parsed) {
    out.push(
      issue(
        'missing-frontmatter',
        'error',
        'Missing YAML frontmatter',
        'Wrap metadata in --- delimiters. Include description and either globs or alwaysApply.',
      ),
    );
    return out;
  }

  if (parsed) {
    const { frontmatter, body } = parsed;
    if (!frontmatterValue(frontmatter, 'description')) {
      out.push(
        issue('no-description', 'warning', 'Missing description', 'Add `description:` — shown in Cursor rule picker.'),
      );
    }
    const hasGlobs = Boolean(frontmatterValue(frontmatter, 'globs'));
    const alwaysApply = /alwaysApply:\s*true/i.test(frontmatter);
    if (!hasGlobs && !alwaysApply) {
      out.push(
        issue(
          'no-scope',
          'warning',
          'No globs or alwaysApply',
          'Rules need `globs: **/*.{ts,tsx}` or `alwaysApply: true` to attach to files.',
        ),
      );
    }
    if (body.trim().length < 40) {
      out.push(issue('body-short', 'tip', 'Very short rules body', 'Add concrete, testable conventions — vague rules are ignored.'));
    }
  }

  const secrets = detectSecretsIn(content);
  if (secrets.length > 0) {
    out.push(
      issue(
        'secret-leak',
        'error',
        'Possible secret in rules',
        `Detected: ${secrets.join(', ')}. Remove and rotate; use environment variables.`,
      ),
    );
  }

  if (!/(security|auth|secret|validate|sanitiz)/i.test(content)) {
    out.push(
      issue(
        'no-security-guardrail',
        'tip',
        'No security guardrail found',
        'Consider a rule like "Never log secrets" or "New endpoints require authorization".',
      ),
    );
  }

  return out;
}

/** Lint hooks.json content. */
export function lintHooks(content: string): LintIssue[] {
  const out: LintIssue[] = [];
  if (!content.trim()) {
    out.push(issue('hooks-empty', 'warning', 'Empty hooks.json', 'Nothing to lint.'));
    return out;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    out.push(issue('hooks-invalid-json', 'error', 'Invalid JSON', 'hooks.json must be valid JSON.'));
    return out;
  }

  const secrets = detectSecretsIn(content);
  if (secrets.length > 0) {
    out.push(
      issue('hooks-secret', 'error', 'Possible secret in hooks', `Detected: ${secrets.join(', ')}. Use env vars instead.`),
    );
  }

  if (/\|\s*bash\b/i.test(content) || /curl\s+[^\n|]*\|\s*(ba)?sh/i.test(content)) {
    out.push(
      issue('hooks-curl-pipe', 'error', 'curl pipe to shell', 'Avoid piping remote scripts into a shell from hooks.'),
    );
  }

  if (/\brm\s+-rf\b/i.test(content)) {
    out.push(issue('hooks-destructive', 'warning', 'Destructive command in hooks', 'Hooks should not run broad delete commands.'));
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const keys = Object.keys(parsed as Record<string, unknown>);
    if (keys.length === 0) {
      out.push(issue('hooks-empty-object', 'tip', 'No hooks defined', 'Empty hooks object — remove file or add intentional hooks.'));
    }
  }

  return out;
}

export interface RulesLintInput {
  rules?: string;
  rulesFilename?: string;
  hooks?: string;
}

export function lintRulesBundle(input: RulesLintInput): LintIssue[] {
  const out: LintIssue[] = [];
  if (input.rules?.trim()) out.push(...lintMdc(input.rules, input.rulesFilename ?? 'project.mdc'));
  if (input.hooks?.trim()) out.push(...lintHooks(input.hooks));
  if (!input.rules?.trim() && !input.hooks?.trim()) {
    out.push(issue('no-input', 'warning', 'Nothing to lint', 'Paste rules (.mdc) and/or hooks.json.'));
  }
  return out;
}
