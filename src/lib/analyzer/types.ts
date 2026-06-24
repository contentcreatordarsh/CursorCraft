export type Severity = 'critical' | 'warning' | 'tip';

export type FileKey = 'cursorignore' | 'rules' | 'mcp' | 'settings' | 'hooks';

export interface ConfigInput {
  cursorignore?: string;
  rules?: string;
  mcp?: string;
  settings?: string;
  hooks?: string;
}

export interface Finding {
  /** Stable id for keys/testing. */
  id: string;
  severity: Severity;
  /** Short headline. */
  title: string;
  /** Plain-English explanation of why it matters. */
  explanation: string;
  /** Concrete, actionable fix. */
  fix: string;
  /** Which input this finding relates to. */
  source: FileKey | 'general';
}

export interface AuditRule {
  id: string;
  /** Returns zero or more findings for the given input. */
  run: (input: ConfigInput) => Finding[];
}

export interface AuditResult {
  findings: Finding[];
  counts: Record<Severity, number>;
  /** True when the user provided at least one non-empty file. */
  hasInput: boolean;
  /** Number of distinct files provided. */
  filesProvided: number;
}
