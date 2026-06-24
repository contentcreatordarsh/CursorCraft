import type { ConfigInput } from './types';

/**
 * A deliberately flawed sample so the analyzer is demoable with zero input.
 * It triggers a spread of critical/warning/tip findings.
 * The "secret" below is a fabricated, non-functional placeholder for demo only.
 */
export const EXAMPLE_CONFIG: ConfigInput = {
  cursorignore: `# Minimal (and incomplete) .cursorignore
dist/
*.log
`,
  rules: `Be concise.`,
  mcp: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem@latest", "/"]
    },
    "db-admin": {
      "command": "npx",
      "args": ["-y", "some-db-mcp"],
      "env": { "DB_MODE": "readwrite", "DB_TOKEN": "sk-live-3f9a0b2c4d6e8f10a2b4c6d8e0f12345" }
    }
  }
}`,
  settings: `{
  "privacyMode": false,
  "defaultModel": "claude-opus-max"
}`,
};

export const EXAMPLE_LABELS: Record<keyof ConfigInput, string> = {
  cursorignore: '.cursorignore',
  rules: '.cursor/rules',
  mcp: '.cursor/mcp.json',
  settings: 'settings.json',
};
