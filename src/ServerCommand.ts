export function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '');
}

/**
 * OpenCode 2.x removed `opencode web`. Existing settings still carry the old
 * command, so upgrade it in place instead of forcing users to edit settings.
 */
export function normalizeServerCommand(command: string | undefined): string | undefined {
  if (!command) {
    return command;
  }
  return command.replace(
    /\bopencode(?:\.cmd|\.exe)?\s+web\b/g,
    (match) => match.replace(/\bweb\b/, 'serve'),
  );
}

/** Reads the password that `opencode serve` prints on startup. */
export function parseServerPassword(line: string): string {
  const match = /(?:^|\s)server password\s+(\S+)/i.exec(stripAnsi(line));
  return match?.[1] || '';
}
