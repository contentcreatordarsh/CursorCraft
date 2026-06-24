import type { IconName } from '@/components/ui/Icon.astro';

export interface ChecklistItem {
  id: string;
  label: string;
  /** Short, plain-English rationale shown in the expander. */
  why: string;
  /** Optional deep link into the security guide. */
  ref?: string;
}

export interface ChecklistRole {
  id: string;
  label: string;
  icon: IconName;
  tagline: string;
  items: ChecklistItem[];
}

const SEC = '/learn/security';

export const ROLES: ChecklistRole[] = [
  {
    id: 'ic',
    label: 'Individual IC',
    icon: 'terminal',
    tagline: 'Your day-to-day habits as someone writing code with Cursor.',
    items: [
      {
        id: 'ic-privacy',
        label: 'Privacy Mode is enabled on my account',
        why: 'Privacy Mode governs whether your code can be retained or used for training. For proprietary work it should always be on.',
        ref: `${SEC}#1-privacy-mode--govern-data-handling`,
      },
      {
        id: 'ic-cursorignore',
        label: 'Every repo I work in has a .cursorignore that excludes secrets',
        why: 'A .cursorignore keeps .env files, keys, and credentials out of the model\u2019s context entirely — the most effective way to prevent secret leakage.',
        ref: `${SEC}#2-cursorignore--keep-secrets-out-of-context-entirely`,
      },
      {
        id: 'ic-no-paste-secrets',
        label: 'I never paste secrets into prompts, rules, or settings',
        why: 'Anything you type into a prompt or rule becomes model context. Reference environment variables instead; rotate anything that slips in.',
        ref: `${SEC}#3-secret-hygiene`,
      },
      {
        id: 'ic-review-diffs',
        label: 'I review AI diffs carefully, especially auth and data logic',
        why: 'AI writes plausible code that can quietly remove a permission check or leak data. Read security-sensitive diffs line by line.',
        ref: `${SEC}#4-review-ai-diffs-like-an-adversary--especially-auth--data-logic`,
      },
      {
        id: 'ic-understand-merge',
        label: 'I never merge a diff I don\u2019t understand',
        why: 'The most dangerous changes look reasonable. If you can\u2019t explain why each change is correct, don\u2019t merge it.',
        ref: `${SEC}#4-review-ai-diffs-like-an-adversary--especially-auth--data-logic`,
      },
      {
        id: 'ic-mcp-trust',
        label: 'I only run MCP servers I trust, scoped to least privilege',
        why: 'Each MCP server can read inputs and act on your behalf. Prefer trusted, pinned sources and the narrowest scope that works.',
        ref: `${SEC}#mcp`,
      },
      {
        id: 'ic-untrusted-input',
        label: 'I treat untrusted input (web pages, issues, tool output) as adversarial',
        why: 'Content the agent reads can contain prompt-injection instructions. Don\u2019t auto-approve actions triggered by untrusted content.',
        ref: `${SEC}#6-prompt-injection-from-untrusted-inputs`,
      },
    ],
  },
  {
    id: 'lead',
    label: 'Team Lead',
    icon: 'git-branch',
    tagline: 'Making the secure setup the default for your team.',
    items: [
      {
        id: 'lead-baseline-ignore',
        label: 'A strong baseline .cursorignore ships in every team repo',
        why: 'Defaults beat reminders. Shipping a baseline ignore file means no one has to remember to exclude secrets.',
        ref: `${SEC}#2-cursorignore--keep-secrets-out-of-context-entirely`,
      },
      {
        id: 'lead-rules-guardrails',
        label: '.cursor/rules encodes our conventions and security guardrails',
        why: 'Rules are applied to every interaction. Encode "new endpoints require an auth check" and "never log secrets" once, not in every prompt.',
        ref: `${SEC}`,
      },
      {
        id: 'lead-vet-mcp',
        label: 'MCP servers are vetted centrally and pinned to trusted versions',
        why: 'A compromised or over-scoped MCP server affects the whole team. Vet and pin them rather than letting each person add their own.',
        ref: `${SEC}#mcp`,
      },
      {
        id: 'lead-review-norms',
        label: 'Code review explicitly covers AI changes to auth, data, and input handling',
        why: 'Make adversarial review of security-sensitive diffs a team norm, not an individual\u2019s good habit.',
        ref: `${SEC}#4-review-ai-diffs-like-an-adversary--especially-auth--data-logic`,
      },
      {
        id: 'lead-privacy-team',
        label: 'Everyone on the team has Privacy Mode enabled',
        why: 'One person with Privacy Mode off can expose shared code. Verify it across the team, not just for yourself.',
        ref: `${SEC}#1-privacy-mode--govern-data-handling`,
      },
      {
        id: 'lead-spend-limits',
        label: 'Soft spend limits and alerts are configured',
        why: 'Spend caps are both a budget control and a guardrail against runaway automation or abuse.',
        ref: `${SEC}#enterprise-controls`,
      },
      {
        id: 'lead-secret-scanning',
        label: 'Pre-commit secret scanning is in place',
        why: '.cursorignore reduces what the AI sees, but real secrets should never reach the repo. Scanning catches them before commit.',
        ref: `${SEC}#3-secret-hygiene`,
      },
    ],
  },
  {
    id: 'secops',
    label: 'Security & Ops',
    icon: 'building',
    tagline: 'Enforcing policy and governance across the organization.',
    items: [
      {
        id: 'secops-privacy-org',
        label: 'Privacy Mode is enforced organization-wide (not opt-in)',
        why: 'Make the secure configuration the default so a new hire\u2019s account is safe without any action.',
        ref: `${SEC}#enterprise-controls`,
      },
      {
        id: 'secops-sso',
        label: 'SSO / SAML / SCIM is configured for provisioning and deprovisioning',
        why: 'Centralized auth and automated provisioning ensure access tracks employment — and is revoked on departure.',
        ref: `${SEC}#enterprise-controls`,
      },
      {
        id: 'secops-audit',
        label: 'Audit logs and AI code tracking are enabled and monitored',
        why: 'Visibility into usage and where AI-generated code enters the codebase is essential for incident response and compliance.',
        ref: `${SEC}#enterprise-controls`,
      },
      {
        id: 'secops-allowlist',
        label: 'Model / provider allow-lists are in place',
        why: 'Restricting which models and providers are permitted aligns AI usage with your data-handling requirements.',
        ref: `${SEC}#enterprise-controls`,
      },
      {
        id: 'secops-soc2',
        label: 'SOC 2 Type 2 report reviewed as part of procurement',
        why: 'A concrete vendor-assessment checkpoint. Request and review it rather than taking compliance on faith.',
        ref: `${SEC}#enterprise-controls`,
      },
      {
        id: 'secops-spend-governance',
        label: 'Spend limits are used as a governance control with per-user/per-model monitoring',
        why: 'Capping spend and watching usage limits the blast radius of abuse and runaway automation, and surfaces cost drivers.',
        ref: `${SEC}#enterprise-controls`,
      },
      {
        id: 'secops-mcp-policy',
        label: 'There is a central policy for vetting and approving MCP servers',
        why: 'MCP servers are privileged integrations. A central allow-list with least-privilege scoping reduces org-wide attack surface.',
        ref: `${SEC}#mcp`,
      },
      {
        id: 'secops-incident',
        label: 'An incident-response path exists for leaked secrets / risky AI changes',
        why: 'Assume something will eventually slip. Have a defined path to rotate credentials and review impact quickly.',
        ref: `${SEC}#3-secret-hygiene`,
      },
    ],
  },
];

export const TOTAL_ITEMS = ROLES.reduce((n, r) => n + r.items.length, 0);
