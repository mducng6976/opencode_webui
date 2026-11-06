import { strictEqual } from 'node:assert';
import { test } from 'node:test';
import {
  normalizeServerCommand,
  parseServerPassword,
  stripAnsi,
} from './ServerCommand';

test('upgrades the removed opencode web command', () => {
  strictEqual(
    normalizeServerCommand('opencode web --port 4096'),
    'opencode serve --port 4096',
  );
  strictEqual(
    normalizeServerCommand('opencode.cmd web --port 4096'),
    'opencode.cmd serve --port 4096',
  );
  strictEqual(
    normalizeServerCommand('opencode.exe web --hostname 0.0.0.0'),
    'opencode.exe serve --hostname 0.0.0.0',
  );
  strictEqual(
    normalizeServerCommand('opencode serve --port 4096'),
    'opencode serve --port 4096',
  );
  strictEqual(normalizeServerCommand(''), '');
  strictEqual(normalizeServerCommand(undefined), undefined);
});

test('reads the password printed by opencode serve', () => {
  strictEqual(
    parseServerPassword('server password abc123'),
    'abc123',
  );
  strictEqual(
    parseServerPassword('\u001b[32mserver password\u001b[0m tok_en-42'),
    'tok_en-42',
  );
  strictEqual(parseServerPassword('server listening on http://127.0.0.1:4096'), '');
});

test('strips ANSI escape sequences', () => {
  strictEqual(stripAnsi('\u001b[31mred\u001b[0m'), 'red');
});
