import { deepStrictEqual, strictEqual } from 'node:assert';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import {
  buildServerBootstrapScript,
  OPENCODE_SERVER_STATE_KEY,
} from './OpenCodeProjectBootstrap';

interface RunOptions {
  origin?: string;
  password?: string;
  label?: string;
  initialState?: unknown;
}

function runBootstrap(options: RunOptions = {}): Map<string, string> {
  const values = new Map<string, string>();
  if (options.initialState !== undefined) {
    values.set(OPENCODE_SERVER_STATE_KEY, JSON.stringify(options.initialState));
  }
  const origin = options.origin ?? 'http://127.0.0.1:4097';
  const window: Record<string, unknown> = {
    location: { origin },
    localStorage: {
      getItem(key: string) {
        return values.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        values.set(key, value);
      },
    },
    navigator: {},
    caches: {
      keys: () => Promise.resolve([]),
      delete: () => Promise.resolve(true),
    },
  };
  const source = buildServerBootstrapScript({ password: options.password, label: options.label })
    .replace(/^<script>\s*/, '')
    .replace(/\s*<\/script>$/, '');
  runInNewContext(source, { window, Promise });
  return values;
}

test('seeds the proxy origin and password for OpenCode 2.x', () => {
  const values = runBootstrap({ password: 'secret', label: 'Local Server' });
  const state = JSON.parse(values.get(OPENCODE_SERVER_STATE_KEY) ?? '{}');

  strictEqual(state.list.length, 1);
  strictEqual(state.list[0].type, 'http');
  strictEqual(state.list[0].http.url, 'http://127.0.0.1:4097');
  strictEqual(state.list[0].http.password, 'secret');
  strictEqual(state.list[0].displayName, 'Local Server');
  deepStrictEqual(state.hidden, {});
  deepStrictEqual(state.lastProjectID, {});
  deepStrictEqual(state.usedProjectIDs, {});
  deepStrictEqual(state.hostnames, {});
  deepStrictEqual(state.projects, {});
});

test('updates the matching origin and keeps other servers', () => {
  const initialState = {
    list: [
      { type: 'http', http: { url: 'http://127.0.0.1:4097', password: 'old' } },
      { type: 'http', http: { url: 'http://example.test:4096' } },
    ],
    hidden: { other: true },
    lastProjectID: { other: 'project' },
    usedProjectIDs: { other: ['project'] },
    hostnames: { other: 'host' },
    projects: { other: { worktree: '/tmp/project' } },
  };
  const values = runBootstrap({ password: 'new', initialState });
  const state = JSON.parse(values.get(OPENCODE_SERVER_STATE_KEY) ?? '{}');

  strictEqual(state.list.length, 2);
  strictEqual(state.list[0].http.password, 'new');
  strictEqual(state.list[1].http.url, 'http://example.test:4096');
  deepStrictEqual(state.hidden, { other: true });
  strictEqual(state.lastProjectID.other, 'project');
  strictEqual(state.usedProjectIDs.other[0], 'project');
  strictEqual(state.hostnames.other, 'host');
  strictEqual(state.projects.other.worktree, '/tmp/project');
});

test('drops state written by the pre-2.0 sidebar bootstrap', () => {
  const initialState = {
    list: [],
    projects: { local: [{ worktree: 'C:/old' }] },
    lastProject: { local: 'C:/old' },
    recentlyClosed: { local: ['C:/old'] },
  };
  const values = runBootstrap({ initialState });
  const state = JSON.parse(values.get(OPENCODE_SERVER_STATE_KEY) ?? '{}');

  deepStrictEqual(state.projects, {});
  strictEqual('lastProject' in state, false);
  strictEqual('recentlyClosed' in state, false);
});

test('omits the password when the server does not require one', () => {
  const values = runBootstrap();
  const state = JSON.parse(values.get(OPENCODE_SERVER_STATE_KEY) ?? '{}');
  strictEqual('password' in state.list[0].http, false);
});
