import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'cursorcraft-guide-progress';

interface ProgressState {
  enabled: boolean;
  read: string[];
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: false, read: [] };
    const parsed = JSON.parse(raw) as ProgressState;
    return { enabled: Boolean(parsed.enabled), read: Array.isArray(parsed.read) ? parsed.read : [] };
  } catch {
    return { enabled: false, read: [] };
  }
}

function saveState(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface GuideProgressProps {
  guideIds: string[];
  /** When set, show mark-as-read for this guide */
  currentGuideId?: string;
  /** compact = bar only; full = opt-in + list */
  variant?: 'compact' | 'full' | 'mark';
}

export default function GuideProgress({
  guideIds,
  currentGuideId,
  variant = 'full',
}: GuideProgressProps) {
  const [state, setState] = useState<ProgressState>({ enabled: false, read: [] });

  useEffect(() => {
    setState(loadState());
  }, []);

  const persist = useCallback((next: ProgressState) => {
    setState(next);
    saveState(next);
  }, []);

  const toggleEnabled = () => {
    persist({ ...state, enabled: !state.enabled });
  };

  const markRead = (id: string) => {
    if (!state.enabled || state.read.includes(id)) return;
    persist({ ...state, read: [...state.read, id] });
  };

  const reset = () => persist({ enabled: state.enabled, read: [] });

  useEffect(() => {
    if (!currentGuideId || !state.enabled || variant !== 'mark') return;

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const height = document.documentElement.scrollHeight;
      if (scrolled >= height * 0.88) markRead(currentGuideId);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentGuideId, state.enabled, state.read, variant]);

  const done = state.read.filter((id) => guideIds.includes(id)).length;
  const total = guideIds.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (variant === 'mark' && state.enabled && currentGuideId) {
    const isRead = state.read.includes(currentGuideId);
    return (
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-sm text-[var(--color-paper-400)]">
          {isRead ? 'Marked as read in your local progress.' : 'Finished this guide?'}
        </p>
        {!isRead && (
          <button type="button" className="btn-secondary" onClick={() => markRead(currentGuideId)}>
            Mark as read
          </button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    if (!state.enabled) return null;
    return (
      <div className="mb-6 panel p-4">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-[var(--color-paper-300)]">Playbook progress</span>
          <span className="font-mono text-[var(--color-paper-100)]">
            {done}/{total} ({pct}%)
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-ink-800)]">
          <div className="h-full rounded-full bg-[var(--color-paper-300)] transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 panel p-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={state.enabled}
          onChange={toggleEnabled}
          className="mt-1 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-paper-300)]"
        />
        <span>
          <span className="block text-sm font-medium text-[var(--color-paper-100)]">
            Track reading progress locally
          </span>
          <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
            Opt-in only. Stored in your browser — never uploaded. Guides auto-mark when you scroll to the end.
          </span>
        </span>
      </label>

      {state.enabled && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-[var(--color-paper-400)]">{done} of {total} guides read</span>
            <button type="button" onClick={reset} className="font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-paper-200)]">
              Reset
            </button>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-ink-800)]">
            <div className="h-full rounded-full bg-[var(--color-paper-300)]" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {guideIds.map((id) => (
              <li key={id} className="font-mono text-xs text-[var(--color-paper-400)]">
                {state.read.includes(id) ? '✓' : '○'} {id.replace(/-/g, ' ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
