import { useMemo, useState } from 'react';
import {
  Terminal,
  GitBranch,
  Building2,
  ChevronDown,
  Check,
  RotateCcw,
  ShieldCheck,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { ROLES, type ChecklistRole } from '@/lib/security-checklist/data';

const ROLE_ICONS: Record<string, LucideIcon> = {
  ic: Terminal,
  lead: GitBranch,
  secops: Building2,
};

export default function SecurityChecklist() {
  // In-memory only: a Set of checked item ids. Never persisted.
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [activeRoleId, setActiveRoleId] = useState<string>(ROLES[0]!.id);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const activeRole = useMemo<ChecklistRole>(
    () => ROLES.find((r) => r.id === activeRoleId) ?? ROLES[0]!,
    [activeRoleId],
  );

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const roleDone = activeRole.items.filter((i) => checked.has(i.id)).length;
  const roleTotal = activeRole.items.length;
  const rolePct = roleTotal === 0 ? 0 : Math.round((roleDone / roleTotal) * 100);

  const resetRole = () =>
    setChecked((prev) => {
      const next = new Set(prev);
      for (const i of activeRole.items) next.delete(i.id);
      return next;
    });

  const allComplete = roleDone === roleTotal && roleTotal > 0;

  return (
    <div>
      {/* Role tabs */}
      <div
        role="tablist"
        aria-label="Choose your role"
        className="mb-6 grid gap-2 sm:grid-cols-3"
      >
        {ROLES.map((role) => {
          const RoleIcon = ROLE_ICONS[role.id] ?? Terminal;
          const active = role.id === activeRoleId;
          const done = role.items.filter((i) => checked.has(i.id)).length;
          return (
            <button
              key={role.id}
              role="tab"
              type="button"
              id={`role-tab-${role.id}`}
              aria-selected={active}
              aria-controls="checklist-panel"
              onClick={() => setActiveRoleId(role.id)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                active
                  ? 'border-[var(--color-accent-500)] bg-[color-mix(in_srgb,var(--color-accent-500)_12%,transparent)]'
                  : 'border-[var(--color-ink-700)] bg-[var(--color-ink-900)]/60 hover:border-[var(--color-ink-600)]'
              }`}
            >
              <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                  active
                    ? 'border-[var(--color-accent-500)] text-[var(--color-accent-400)]'
                    : 'border-[var(--color-ink-600)] bg-[var(--color-ink-800)] text-[var(--color-paper-300)]'
                }`}
              >
                <RoleIcon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--color-paper-50)]">
                  {role.label}
                </span>
                <span className="mt-0.5 block font-mono text-[0.7rem] text-[var(--color-paper-400)]">
                  {done}/{role.items.length} done
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress meter */}
      <div className="mb-6 rounded-xl border border-[var(--color-ink-700)] bg-[var(--color-ink-900)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-paper-400)]">
              {activeRole.label} progress
            </p>
            <p className="mt-0.5 text-sm text-[var(--color-paper-300)]">{activeRole.tagline}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-2xl font-bold"
              style={{ color: allComplete ? 'var(--color-tip)' : 'var(--color-paper-50)' }}
            >
              {rolePct}%
            </span>
            <button
              type="button"
              onClick={resetRole}
              disabled={roleDone === 0}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--color-paper-400)] transition-colors hover:text-[var(--color-paper-100)] disabled:pointer-events-none disabled:opacity-40"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-ink-800)]"
          role="progressbar"
          aria-valuenow={rolePct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${activeRole.label} checklist completion`}
        >
          <div
            className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
            style={{
              width: `${rolePct}%`,
              background: allComplete
                ? 'var(--color-tip)'
                : 'linear-gradient(90deg, var(--color-accent-500), var(--color-cyan-400))',
            }}
          />
        </div>
        {allComplete && (
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--color-tip)]">
            <ShieldCheck size={16} aria-hidden="true" />
            All set for the {activeRole.label} role. Nice work.
          </p>
        )}
      </div>

      {/* Checklist */}
      <div id="checklist-panel" role="tabpanel" aria-labelledby={`role-tab-${activeRole.id}`}>
      <ul className="space-y-2.5">
        {activeRole.items.map((item) => {
          const isChecked = checked.has(item.id);
          const isOpen = expanded.has(item.id);
          return (
            <li
              key={item.id}
              className={`rounded-xl border transition-colors ${
                isChecked
                  ? 'border-[color-mix(in_srgb,var(--color-tip)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-tip)_7%,transparent)]'
                  : 'border-[var(--color-ink-700)] bg-[var(--color-ink-900)]/60'
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(item.id)}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-[var(--color-ink-600)] bg-[var(--color-ink-950)] accent-[var(--color-accent-500)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-400)]"
                  />
                  <span
                    className={`text-sm leading-relaxed ${
                      isChecked
                        ? 'text-[var(--color-paper-400)] line-through'
                        : 'text-[var(--color-paper-100)]'
                    }`}
                  >
                    {item.label}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`why-${item.id}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[var(--color-ink-600)] px-2 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--color-paper-400)] transition-colors hover:border-[var(--color-accent-500)] hover:text-[var(--color-paper-100)]"
                >
                  Why
                  <ChevronDown
                    size={13}
                    aria-hidden="true"
                    className={`transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
              {isOpen && (
                <div
                  id={`why-${item.id}`}
                  className="border-t border-[var(--color-ink-700)] px-4 py-3 pl-12"
                >
                  <p className="text-sm leading-relaxed text-[var(--color-paper-300)]">{item.why}</p>
                  {item.ref && (
                    <a
                      href={item.ref}
                      className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-[var(--color-accent-400)] underline"
                    >
                      Read more in the security guide
                      <ArrowUpRight size={12} aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      </div>

      <p className="mt-5 flex items-center gap-2 font-mono text-xs text-[var(--color-paper-400)]">
        <Check size={13} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
        Progress is tracked in memory only — nothing is saved or uploaded. Refreshing the page clears it.
      </p>
    </div>
  );
}
