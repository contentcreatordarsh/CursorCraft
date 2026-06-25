import { useMemo, useState } from 'react';
import { Lock, Network, AlertOctagon, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { analyzeMcp, type McpRisk } from '@/lib/mcp-visualizer/analyze';

const RISK_STYLE: Record<McpRisk, { color: string; bg: string; border: string; Icon: typeof AlertOctagon }> = {
  critical: {
    color: 'var(--color-danger)',
    bg: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
    border: 'color-mix(in srgb, var(--color-danger) 40%, transparent)',
    Icon: AlertOctagon,
  },
  warning: {
    color: 'var(--color-warn)',
    bg: 'color-mix(in srgb, var(--color-warn) 10%, transparent)',
    border: 'color-mix(in srgb, var(--color-warn) 40%, transparent)',
    Icon: AlertTriangle,
  },
  tip: {
    color: 'var(--color-info)',
    bg: 'color-mix(in srgb, var(--color-info) 10%, transparent)',
    border: 'color-mix(in srgb, var(--color-info) 40%, transparent)',
    Icon: Lightbulb,
  },
  ok: {
    color: 'var(--color-tip)',
    bg: 'color-mix(in srgb, var(--color-tip) 10%, transparent)',
    border: 'color-mix(in srgb, var(--color-tip) 40%, transparent)',
    Icon: CheckCircle2,
  },
};

const EXAMPLE = `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem@latest", "/"]
    },
    "docs": {
      "url": "http://internal.corp/mcp/sse"
    }
  }
}`;

export default function McpVisualizer() {
  const [raw, setRaw] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const analysis = useMemo(() => analyzeMcp(raw), [raw]);
  const show = submitted && raw.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-tip)_8%,transparent)] px-4 py-2.5 panel">
        <Lock size={15} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
        <p className="font-mono text-xs text-[var(--color-paper-200)]">
          Parsed entirely in your browser — mcp.json never leaves this page.
        </p>
      </div>

      <div>
        <label htmlFor="mcp-json" className="mb-2 block font-mono text-xs text-[var(--color-paper-400)]">
          Paste .cursor/mcp.json
        </label>
        <textarea
          id="mcp-json"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            if (submitted) setSubmitted(false);
          }}
          placeholder={EXAMPLE}
          spellCheck={false}
          rows={12}
          className="input-field"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setSubmitted(true)} disabled={!raw.trim()} className="btn-primary">
            <Network size={16} aria-hidden="true" />
            Visualize scope
          </button>
          <button type="button" onClick={() => { setRaw(EXAMPLE); setSubmitted(true); }} className="btn-secondary">
            Load example
          </button>
        </div>
      </div>

      {show && !analysis.valid && analysis.error && (
        <p role="alert" className="rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {analysis.error}
        </p>
      )}

      {show && analysis.valid && (
        <div className="space-y-4">
          {analysis.servers.length === 0 ? (
            <p className="text-sm text-[var(--color-paper-400)]">No MCP servers defined under mcpServers.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[color-mix(in_srgb,var(--color-danger)_40%,transparent)] px-2.5 py-0.5 font-mono text-xs text-[var(--color-danger)]">
                  {analysis.summary.critical} critical
                </span>
                <span className="rounded-full border border-[color-mix(in_srgb,var(--color-warn)_40%,transparent)] px-2.5 py-0.5 font-mono text-xs text-[var(--color-warn)]">
                  {analysis.summary.warning} warning
                </span>
                <span className="rounded-full border border-[color-mix(in_srgb,var(--color-info)_40%,transparent)] px-2.5 py-0.5 font-mono text-xs text-[var(--color-info)]">
                  {analysis.summary.tip} tip
                </span>
              </div>

              {analysis.servers.map((server) => (
                <article key={server.name} className="panel p-4">
                  <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-mono text-sm font-semibold text-[var(--color-paper-50)]">{server.name}</h3>
                    <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 font-mono text-[0.65rem] text-[var(--color-muted)]">
                      {server.transport}
                    </span>
                  </header>
                  {server.command && (
                    <p className="mb-2 font-mono text-xs text-[var(--color-paper-400)]">
                      <span className="text-[var(--color-muted)]">command:</span> {server.command}{' '}
                      {(server.args ?? []).join(' ')}
                    </p>
                  )}
                  {server.url && (
                    <p className="mb-2 font-mono text-xs text-[var(--color-paper-400)]">
                      <span className="text-[var(--color-muted)]">url:</span> {server.url}
                    </p>
                  )}
                  {server.envKeys.length > 0 && (
                    <p className="mb-3 font-mono text-xs text-[var(--color-paper-400)]">
                      <span className="text-[var(--color-muted)]">env:</span> {server.envKeys.join(', ')}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {server.risks.map((risk) => {
                      const style = RISK_STYLE[risk.level];
                      return (
                        <li
                          key={risk.title}
                          className="rounded-lg border p-3"
                          style={{ borderColor: style.border, background: style.bg }}
                        >
                          <div className="flex items-start gap-2">
                            <style.Icon size={16} style={{ color: style.color }} className="mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-[var(--color-paper-100)]">{risk.title}</p>
                              <p className="mt-0.5 text-xs text-[var(--color-paper-400)]">{risk.detail}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
