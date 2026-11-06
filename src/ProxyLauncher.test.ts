import { strictEqual, ok } from 'node:assert';
import { test } from 'node:test';
import {
  buildProxyStartScript,
  generateServerPassword,
} from './ProxyLauncher';

test('runs proxy-on before the server and shares the password', () => {
  const script = buildProxyStartScript({
    proxyCommand: 'proxy-on',
    serverCommand: 'opencode serve --port 4096',
    password: 'abc123',
    pidFile: 'C:\\Temp\\opencode.pid',
  });

  const proxyAt = script.indexOf('proxy-on');
  const serverAt = script.indexOf('opencode serve --port 4096');
  ok(proxyAt >= 0);
  ok(serverAt > proxyAt);
  ok(script.includes("$env:OPENCODE_SERVER_PASSWORD = 'abc123'"));
  ok(script.includes("Set-Content -LiteralPath 'C:\\Temp\\opencode.pid' -Value $PID"));
});

test('escapes PowerShell single quotes', () => {
  const script = buildProxyStartScript({
    proxyCommand: "proxy-on 'work'",
    serverCommand: 'opencode serve',
    password: "a'b",
    pidFile: "C:\\Temp\\o'brien.pid",
  });

  ok(script.includes("proxy-on 'work'"));
  ok(script.includes("$env:OPENCODE_SERVER_PASSWORD = 'a''b'"));
  ok(script.includes("'C:\\Temp\\o''brien.pid'"));
});

test('generates a non-trivial random password', () => {
  const a = generateServerPassword();
  const b = generateServerPassword();
  strictEqual(a.length, 48);
  strictEqual(/^[0-9a-f]+$/.test(a), true);
  ok(a !== b);
});
