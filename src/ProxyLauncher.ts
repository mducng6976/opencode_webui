import * as crypto from 'crypto';

export interface ProxyStartScriptOptions {
  /** PowerShell command that enables the user's proxy (e.g. `proxy-on`). */
  proxyCommand: string;
  /** Command that starts the OpenCode server. */
  serverCommand: string;
  /** Password the server should accept. */
  password: string;
  /** File the script writes its PowerShell PID to. */
  pidFile: string;
}

export function generateServerPassword(): string {
  return crypto.randomBytes(24).toString('hex');
}

/** PowerShell single-quoted literal. */
function psQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Builds the script that runs `proxy-on` and then the OpenCode server in the
 * same PowerShell session, so the server inherits the proxy environment.
 */
export function buildProxyStartScript(options: ProxyStartScriptOptions): string {
  return [
    "$ErrorActionPreference = 'Continue'",
    '',
    '# Enable the proxy in this shell first; opencode inherits the environment.',
    'try {',
    `  ${options.proxyCommand}`,
    '} catch {',
    "  Write-Host ('proxy-on failed: ' + $_)",
    '}',
    '',
    `$env:OPENCODE_SERVER_PASSWORD = ${psQuote(options.password)}`,
    `Set-Content -LiteralPath ${psQuote(options.pidFile)} -Value $PID -Encoding ascii`,
    options.serverCommand,
    '',
  ].join('\r\n');
}
