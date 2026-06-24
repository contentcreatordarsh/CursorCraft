export type SecurityLevel = 'standard' | 'elevated' | 'high';

export interface RulesAnswers {
  /** Primary language, e.g. "TypeScript". */
  language: string;
  /** Primary framework / runtime, free text, e.g. "Next.js". */
  framework: string;
  /** Package / dependency manager, e.g. "pnpm". */
  packageManager: string;
  /** Whether the repo is a monorepo. */
  monorepo: boolean;
  /** Testing framework, free text, e.g. "Vitest". */
  testing: string;
  /** Free-text conventions, one per line. */
  conventions: string;
  /** How security-sensitive the codebase is. */
  security: SecurityLevel;
}

export interface GeneratedConfig {
  /** Contents for `.cursor/rules/<name>.mdc`. */
  rules: string;
  /** Contents for `.cursorignore`. */
  cursorignore: string;
}

export const DEFAULT_ANSWERS: RulesAnswers = {
  language: 'TypeScript',
  framework: '',
  packageManager: 'npm',
  monorepo: false,
  testing: '',
  conventions: '',
  security: 'standard',
};

export const LANGUAGES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Go',
  'Rust',
  'Java',
  'Kotlin',
  'Ruby',
  'PHP',
  'C#',
  'C++',
  'Swift',
  'Other',
] as const;

export const PACKAGE_MANAGERS = [
  'npm',
  'pnpm',
  'yarn',
  'bun',
  'pip',
  'poetry',
  'uv',
  'cargo',
  'go modules',
  'maven',
  'gradle',
  'bundler',
  'composer',
  'nuget',
  'other',
] as const;

export const SECURITY_LEVELS: { value: SecurityLevel; label: string; hint: string }[] = [
  {
    value: 'standard',
    label: 'Standard',
    hint: 'Typical app or library. Baseline secret hygiene and review discipline.',
  },
  {
    value: 'elevated',
    label: 'Elevated',
    hint: 'Handles user data, auth, or payments. Stricter review and ignore rules.',
  },
  {
    value: 'high',
    label: 'High / Regulated',
    hint: 'PII, healthcare, finance, or compliance scope (e.g. SOC 2, HIPAA, PCI).',
  },
];
