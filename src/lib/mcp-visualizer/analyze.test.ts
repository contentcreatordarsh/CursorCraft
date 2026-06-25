import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMcp } from './analyze.ts';

describe('analyzeMcp', () => {
  it('requires input', () => {
    const r = analyzeMcp('');
    assert.equal(r.valid, false);
  });

  it('flags unpinned npx server', () => {
    const r = analyzeMcp(
      JSON.stringify({
        mcpServers: {
          fs: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem@latest', '/'] },
        },
      }),
    );
    assert.ok(r.servers[0]?.risks.some((x) => x.title.includes('Unpinned')));
    assert.ok(r.summary.critical > 0);
  });

  it('flags broad filesystem path', () => {
    const r = analyzeMcp(
      JSON.stringify({
        mcpServers: {
          fs: { command: 'npx', args: ['-y', 'pkg@1.2.3', '/'] },
        },
      }),
    );
    assert.ok(r.servers[0]?.risks.some((x) => x.title.includes('filesystem')));
  });
});
