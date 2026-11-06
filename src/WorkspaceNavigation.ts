export interface TrackedIframePathDecision {
  accept: boolean;
  completesWorkspaceLaunch: boolean;
}

export function encodeOpenCodeRouteSegment(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * OpenCode 2.x addresses a session with
 * `/server/<base64url(serverUrl)>/session/<sessionID>`.
 */
export function getServerSessionPath(serverUrl: string, sessionId: string): string {
  if (!serverUrl || !sessionId) {
    return '';
  }
  return `/server/${encodeOpenCodeRouteSegment(serverUrl)}/session/${encodeURIComponent(sessionId)}`;
}

export function decideTrackedIframePath(
  path: string,
  workspaceLaunchPending: boolean,
  workspaceLaunchPath: string,
): TrackedIframePathDecision {
  if (!isRelativeAppPath(path)) {
    return { accept: false, completesWorkspaceLaunch: false };
  }
  if (!workspaceLaunchPending) {
    return { accept: true, completesWorkspaceLaunch: false };
  }
  if (workspaceLaunchPath && path === workspaceLaunchPath) {
    return { accept: true, completesWorkspaceLaunch: true };
  }
  // OpenCode may restore its persisted home or tab route before our target
  // session is rendered. Keep the launch authoritative until a concrete
  // session (or its draft) is visible.
  if (isNewSessionDraftPath(path) || isConcreteSessionPath(path)) {
    return { accept: true, completesWorkspaceLaunch: true };
  }
  return { accept: false, completesWorkspaceLaunch: false };
}

function isRelativeAppPath(value: string): boolean {
  if (!value.startsWith('/') || value.startsWith('//')) {
    return false;
  }
  try {
    const url = new URL(value, 'http://opencode.local');
    return url.origin === 'http://opencode.local';
  } catch {
    return false;
  }
}

function isNewSessionDraftPath(value: string): boolean {
  const url = new URL(value, 'http://opencode.local');
  return url.pathname === '/new-session' && !!url.searchParams.get('draftId');
}

function isConcreteSessionPath(value: string): boolean {
  const pathname = new URL(value, 'http://opencode.local').pathname;
  return /^\/server\/[^/]+\/session\/[^/]+$/.test(pathname)
    || /^\/[^/]+\/session\/[^/]+$/.test(pathname);
}
