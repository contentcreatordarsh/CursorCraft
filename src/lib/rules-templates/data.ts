import type { RulesAnswers } from '@/lib/rules-generator/types';

export interface RulesTemplate {
  id: string;
  title: string;
  description: string;
  stack: string;
  tags: string[];
  answers: RulesAnswers;
}

export const RULES_TEMPLATES: RulesTemplate[] = [
  {
    id: 'nextjs',
    title: 'Next.js App Router',
    description:
      'TypeScript + Next.js 15 with App Router, server components by default, and elevated security for user-facing apps.',
    stack: 'TypeScript · Next.js · pnpm',
    tags: ['nextjs', 'react', 'typescript', 'fullstack'],
    answers: {
      language: 'TypeScript',
      framework: 'Next.js (App Router)',
      packageManager: 'pnpm',
      monorepo: false,
      testing: 'Vitest + Playwright',
      conventions: [
        'Server Components by default; add "use client" only when needed.',
        'Colocate route handlers under app/api; validate input with Zod at boundaries.',
        'Use next/image and next/font; avoid raw <img> tags.',
        'Prefer Server Actions for mutations; never expose secrets in client bundles.',
      ].join('\n'),
      security: 'elevated',
    },
  },
  {
    id: 'python',
    title: 'Python API (FastAPI)',
    description:
      'FastAPI service with strict typing, pytest, and high security defaults for APIs handling sensitive data.',
    stack: 'Python · FastAPI · uv',
    tags: ['python', 'fastapi', 'api', 'backend'],
    answers: {
      language: 'Python',
      framework: 'FastAPI',
      packageManager: 'uv',
      monorepo: false,
      testing: 'pytest',
      conventions: [
        'Use Pydantic models for all request/response schemas.',
        'Keep routers thin; business logic in services/ modules.',
        'Async endpoints by default; avoid blocking calls in the event loop.',
        'Log structured JSON; never log tokens, passwords, or PII.',
      ].join('\n'),
      security: 'high',
    },
  },
  {
    id: 'monorepo',
    title: 'TypeScript Monorepo',
    description:
      'pnpm workspaces with shared packages, Turborepo-style boundaries, and standard security for multi-package repos.',
    stack: 'TypeScript · pnpm workspaces',
    tags: ['monorepo', 'turborepo', 'typescript', 'workspaces'],
    answers: {
      language: 'TypeScript',
      framework: 'pnpm workspaces',
      packageManager: 'pnpm',
      monorepo: true,
      testing: 'Vitest',
      conventions: [
        'Packages live under packages/* and apps/*; no cross-app deep imports.',
        'Shared types in packages/shared; apps depend inward, never sideways across apps.',
        'Run checks from root with pnpm -r; respect workspace protocol for internal deps.',
        'Each package exports a public API via package.json exports field.',
      ].join('\n'),
      security: 'standard',
    },
  },
  {
    id: 'fintech',
    title: 'Fintech / Regulated',
    description:
      'High-security template for regulated workloads — PCI/SOC2-minded guardrails, audit-friendly diffs, and strict secret hygiene.',
    stack: 'TypeScript · regulated',
    tags: ['fintech', 'pci', 'soc2', 'compliance', 'security'],
    answers: {
      language: 'TypeScript',
      framework: 'Node.js services',
      packageManager: 'pnpm',
      monorepo: false,
      testing: 'Jest + contract tests',
      conventions: [
        'All money-moving code paths require dual review and explicit audit logging.',
        'Never log PAN, CVV, bank account numbers, or raw auth tokens.',
        'Feature flags for risky changes; roll back via config, not hot patches.',
        'Idempotent payment handlers; use idempotency keys on all external calls.',
      ].join('\n'),
      security: 'high',
    },
  },
];

export function getTemplateById(id: string): RulesTemplate | undefined {
  return RULES_TEMPLATES.find((t) => t.id === id);
}
