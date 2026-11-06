import { strictEqual } from 'node:assert';
import { test } from 'node:test';
import {
  decideTrackedIframePath,
  encodeOpenCodeRouteSegment,
  getServerSessionPath,
} from './WorkspaceNavigation';

test('encodes OpenCode route segments as unpadded Base64URL', () => {
  strictEqual(encodeOpenCodeRouteSegment('C:/tmp/ÿ'), 'QzovdG1wL8O_');
  strictEqual(encodeOpenCodeRouteSegment('࠾'), '4KC-');
});

test('builds an OpenCode 2.x server session route', () => {
  strictEqual(
    getServerSessionPath('http://127.0.0.1:4097', 'ses_123'),
    '/server/aHR0cDovLzEyNy4wLjAuMTo0MDk3/session/ses_123',
  );
  strictEqual(getServerSessionPath('', 'ses_123'), '');
  strictEqual(getServerSessionPath('http://127.0.0.1:4097', ''), '');
});

test('completes a workspace launch at its target session route', () => {
  const route = getServerSessionPath('http://127.0.0.1:4097', 'ses_123');
  const decision = decideTrackedIframePath(route, true, route);
  strictEqual(decision.accept, true);
  strictEqual(decision.completesWorkspaceLaunch, true);
});

test('ignores restored home and unrelated tab routes during workspace launch', () => {
  const route = getServerSessionPath('http://127.0.0.1:4097', 'ses_123');
  strictEqual(decideTrackedIframePath('/', true, route).accept, false);
  strictEqual(decideTrackedIframePath('/new-session', true, route).accept, false);
  strictEqual(decideTrackedIframePath('/settings', true, route).accept, false);
});

test('accepts OpenCode 2.x drafts and concrete sessions', () => {
  const route = getServerSessionPath('http://127.0.0.1:4097', 'ses_123');
  for (const path of [
    '/new-session?draftId=draft_123',
    '/server/aHR0cDovL2xvY2FsaG9zdDo0MDk2/session/ses_456',
    '/QzpcV29ya3NwYWNl/session/ses_456',
  ]) {
    const decision = decideTrackedIframePath(path, true, route);
    strictEqual(decision.accept, true);
    strictEqual(decision.completesWorkspaceLaunch, true);
  }
});

test('tracks ordinary navigation after workspace launch completes', () => {
  const decision = decideTrackedIframePath('/', false, '/ignored/session');
  strictEqual(decision.accept, true);
  strictEqual(decision.completesWorkspaceLaunch, false);
});

test('rejects absolute and protocol-relative iframe paths', () => {
  strictEqual(decideTrackedIframePath('https://example.com/', false, '').accept, false);
  strictEqual(decideTrackedIframePath('//example.com/', false, '').accept, false);
});
