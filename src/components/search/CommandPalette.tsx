import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FileText, Gauge, Search, Wrench } from 'lucide-react';
import { searchItems } from '@/lib/search/search';
import type { SearchIndex, SearchItem } from '@/lib/search/types';

type Category = SearchItem['category'];

const CATEGORY_ICON: Record<Category, typeof FileText> = {
  Guide: FileText,
  Tool: Wrench,
  Page: Gauge,
};

let cachedIndex: SearchIndex | null = null;

async function loadIndex(): Promise<SearchIndex> {
  if (cachedIndex) return cachedIndex;
  const res = await fetch('/search-index.json');
  if (!res.ok) throw new Error('Search index unavailable');
  cachedIndex = (await res.json()) as SearchIndex;
  return cachedIndex;
}

export function openCommandPalette(): void {
  window.dispatchEvent(new CustomEvent('cursorcraft:open-search'));
}

interface CommandPaletteProps {
  /** Initial query (e.g. from /search?q=) */
  initialQuery?: string;
  /** When true, render as an inline panel instead of a modal */
  inline?: boolean;
}

export default function CommandPalette({ initialQuery = '', inline = false }: CommandPaletteProps) {
  const [open, setOpen] = useState(inline);
  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    loadIndex()
      .then(setIndex)
      .catch(() => setLoadError('Could not load search index.'));
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setActiveIdx(0);
    };
    window.addEventListener('cursorcraft:open-search', onOpen);
    return () => window.removeEventListener('cursorcraft:open-search', onOpen);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        setActiveIdx(0);
      }
      if (e.key === 'Escape' && open && !inline) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, inline]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const results = useMemo(() => {
    if (!index) return [];
    return searchItems(index.items, query, inline ? 40 : 12);
  }, [index, query, inline]);

  const navigate = useCallback((href: string) => {
    window.location.href = href;
  }, []);

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIdx]) {
      e.preventDefault();
      navigate(results[activeIdx]!.item.href);
    }
  };

  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  if (!inline && !open) return null;

  const panel = (
    <div
      className={
        inline
          ? 'panel overflow-hidden'
          : 'fixed inset-x-4 top-[12vh] z-[200] mx-auto max-w-xl overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-ink-900)] shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:inset-x-auto'
      }
      role={inline ? undefined : 'dialog'}
      aria-modal={inline ? undefined : true}
      aria-label="Search CursorCraft"
    >
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2.5">
        <Search size={16} className="shrink-0 text-[var(--color-muted)]" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Search guides, tools, and pages…"
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-paper-100)] placeholder:text-[var(--color-muted)] focus:outline-none"
          aria-controls="search-results"
          aria-activedescendant={results[activeIdx] ? `search-result-${activeIdx}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        {!inline && (
          <kbd className="kbd hidden shrink-0 sm:inline-flex">Esc</kbd>
        )}
      </div>

      <div className="max-h-[min(60vh,28rem)] overflow-y-auto">
        {loadError && (
          <p className="px-4 py-6 text-center text-sm text-[var(--color-danger)]">{loadError}</p>
        )}
        {!loadError && !index && (
          <p className="px-4 py-6 text-center text-sm text-[var(--color-muted)]">Loading index…</p>
        )}
        {index && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-[var(--color-muted)]">
            {query.trim() ? `No results for “${query.trim()}”.` : 'Type to search guides, tools, and pages.'}
          </p>
        )}
        {results.length > 0 && (
          <ul id="search-results" ref={listRef} role="listbox" className="py-1">
            {results.map(({ item }, i) => {
              const Icon = CATEGORY_ICON[item.category];
              const active = i === activeIdx;
              return (
                <li key={item.id} id={`search-result-${i}`} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                      active
                        ? 'bg-[var(--color-surface-raised)]'
                        : 'hover:bg-[var(--color-surface)]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
                        active
                          ? 'border-[var(--color-border-strong)] bg-[var(--color-ink-850)] text-[var(--color-paper-100)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-paper-300)]'
                      }`}
                    >
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-[var(--color-paper-50)]">
                          {item.title}
                        </span>
                        <span className="shrink-0 font-mono text-[0.65rem] text-[var(--color-muted)]">
                          {item.category}
                        </span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--color-paper-400)]">
                        {item.description}
                      </span>
                    </span>
                    <ArrowRight
                      size={14}
                      className={`mt-1 shrink-0 ${active ? 'text-[var(--color-paper-200)]' : 'text-[var(--color-muted)]'}`}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!inline && (
        <div className="status-bar border-t border-[var(--color-border)]">
          <span>
            <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> navigate
          </span>
          <span>
            <kbd className="kbd">↵</kbd> open · <kbd className="kbd">⌘</kbd>
            <kbd className="kbd">K</kbd> toggle
          </span>
        </div>
      )}
    </div>
  );

  if (inline) return panel;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-[2px]"
        aria-label="Close search"
        onClick={() => setOpen(false)}
      />
      {panel}
    </>
  );
}

// Re-export event name for documentation
export { OPEN_SEARCH_EVENT } from '@/lib/search/types';
