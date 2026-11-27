# OpenCode Sidebar

Renders your [OpenCode](https://opencode.ai) web UI right inside VS Code's sidebar — connects to your server or starts a new one.

This fork targets the current **OpenCode 2.x** web UI (`opencode serve`), including its "connect to a server" flow and generated server password.

> Forked from [bmpenuelas/opencode-web-sidebar](https://github.com/bmpenuelas/opencode-web-sidebar) and maintained by [ducnm](https://github.com/mducng6976).

💫 Automatically opens the current project in a fresh session when the sidebar initializes!

Also available on [Android](https://play.google.com/store/apps/details?id=com.logicedge.opencodemobile) and [iOS](https://apps.apple.com/app/id6787161501) for coding away from your computer:

[![install Android](media/install_google_play_color_light.png)](https://play.google.com/store/apps/details?id=com.logicedge.opencodemobile) [![install iOS](media/install_app_store_color_light.png)](https://apps.apple.com/app/id6787161501)

![screenshot](media/screenshot_0.png)

## Features

- 🖥️ **Sidebar webview** — loads the OpenCode web UI in the secondary sidebar panel
- 🛠️ **Multi-server support** — both local (can start the local server for you) and remote servers can be added and you can switch between them
- 🔗 **Automatic server connection** — seeds OpenCode 2.x's server list with the sidebar proxy, so the UI opens directly in your workspace instead of the "Connect to a server" screen
- 🔑 **Generated password capture** — when the extension starts `opencode serve`, it reads the generated password from the process output and uses it automatically
- 📍 **Workspace routing** — creates a session in the current VS Code folder and opens its OpenCode 2.x route, including folders never opened in OpenCode before
- 🔔 **Status bar indicator** — shows connection state at a glance
- 🚀 **Start/Stop server** — click a button to run `opencode serve` if the server is not running; stop it when done
- 🔃 **Auto-reconnect** — automatically retries when the server is unreachable (with Cancel button)
- 🎨 **Theme sync** — follows VS Code's light/dark mode automatically
- 🔐 **Password support** — credentials stored securely in your OS keychain via VS Code SecretStorage
- 🔐 **Env var fallback** — reads `OPENCODE_SERVER_PASSWORD` if no password is stored
- 🌐 **Proxy** — local proxy strips frame-blocking headers for seamless iframe embedding and prevents losing the cursor focus while typing in files
- 🔗 **Remote SSH** — works with [VSCode Remote SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) via automatic port forwarding

## ❗ Important: requirements

❌ This extension does not include or install `opencode` ➡️ You need to have `opencode` 2.x already installed and configured.

- If you want to start the `opencode serve` server yourself this extension will connect to it automatically ➡️ Start the OpenCode server in your preferred location (Local/LAN, Mac/Linux/Windows/WSL...), open the **OpenCode Sidebar** and it will connect to your server (you can customize the URL, user and password in the extension **Settings**).
- This extension can also start the web server for you on this machine ➡️ Click **Start OpenCode Web Server**. It runs `opencode serve` in the current workspace, captures the generated password, and connects automatically.

<br/>

To start the web server:

`opencode serve --port 4096` To start the web server for your machine only.

`opencode serve --hostname 0.0.0.0 --port 4096` To start the web server and make it reachable in your whole LAN.

ℹ️ `opencode serve` prints a fresh password at startup (`server password ...`). When the extension starts the server it captures that password automatically. If you start the server yourself, copy the password into **OpenCode: Set Server Password**, or set `OPENCODE_SERVER_PASSWORD`.

ℹ️ If you run the web server on WSL or Linux, and run the extension on Windows, you need to enable path conversion via the `opencode-sidebar.workspacePathStyle` setting (set it to **WSL / Linux**).

<br/>

For more OpenCode server config info see the official docs for [OpenCode Web](https://opencode.ai/docs/web/).

## Commands

All commands are available via the Command Palette (`Ctrl+Shift+P`).

| Command | Description |
|---------|-------------|
| `OpenCode: Toggle Panel` | Open or close the sidebar panel |
| `OpenCode: Focus Panel` | Bring the sidebar panel into focus |
| `OpenCode: Close Panel` | Close the sidebar panel |
| `OpenCode: Set Server Password` | Store username and password for password-protected servers |
| `OpenCode: Clear Server Password` | Remove stored credentials from the OS keychain |
| `OpenCode: Start OpenCode Web Server` | Start the web server process (hidden if server is already running) |
| `OpenCode: Start OpenCode Web Server with Proxy` | Open a PowerShell window, run `proxy-on`, then start the web server (Windows) |
| `OpenCode: Stop OpenCode Web Server` | Stop the server process (only shown if the extension started it) |
| `OpenCode: Settings` | Open the extension's settings (also available as a gear icon in the panel title bar) |
| `OpenCode: Open File` | Open a file from the webview (used internally) |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `opencode-sidebar.url` | `http://localhost:4096` | URL of the OpenCode web UI to embed |
| `opencode-sidebar.hideButton` | `false` | Hide the OpenCode icon from the editor title bar |
| `opencode-sidebar.autoReconnect` | `true` | Automatically retry when the server is unreachable |
| `opencode-sidebar.maxReconnectAttempts` | `0` | Maximum reconnection attempts (0 = unlimited) |
| `opencode-sidebar.serverCommand` | `opencode serve --port 4096` | Shell command to start the server |
| `opencode-sidebar.proxyOnCommand` | `proxy-on` | PowerShell command to run before starting the server when using **Start with Proxy** (Windows only) |
| `opencode-sidebar.proxyShell` | `powershell.exe` | PowerShell executable used by **Start with Proxy** (set `pwsh.exe` for PowerShell 7) |
| `opencode-sidebar.workspacePathStyle` | `none` | Path translation mode for workspace folder: `Do not translate` (pass raw path), `WSL / Linux` (convert `C:\...` to `/mnt/c/...` for WSL/Linux servers) |

## Panel controls

The panel has a **status bar** along the top:

- **Status dot** — green (connected), amber (starting / password required), red (disconnected / reconnecting)
- **Stop** — appears when the extension started the server; kills the process (including the PowerShell window started by **Start with Proxy**)
- **Refresh** — reloads the iframe
- **Close** — closes the panel

The **panel title bar** (VS Code's built-in webview header) has a gear icon that opens the extension's settings.

### Connection states

| State | What you see |
|-------|-------------|
| Connected | Green dot, iframe loads your OpenCode UI |
| Password Required | Amber dot, lock icon + "Login" button in the panel |
| Disconnected | Red dot, "Start OpenCode Web Server" (+ "Start with Proxy" on Windows), "Servers" and "Settings" buttons |
| Starting... | Amber dot, spinner while the server process starts |
| Reconnecting... | Red dot, reconnection attempts with exponential backoff (1s → 2s → 4s → ... → 30s max); click **Cancel** to stop retrying |

### Authentication

If your OpenCode server is password-protected:

- When the extension starts `opencode serve` for you, it reads the generated password from the process output and uses it automatically.
- For a server you started yourself, run **`OpenCode: Set Server Password`** from the Command Palette.
- Enter the username (`opencode` for OpenCode 2.x) and password.
- Credentials are stored in your OS keychain via VS Code SecretStorage.
- Alternatively, set the `OPENCODE_SERVER_PASSWORD` environment variable and the extension will pick it up automatically.

## Cài đặt trên máy khác

### 1. Yêu cầu

- VS Code `>= 1.106`
- OpenCode **2.x** đã cài và có trong `PATH`:
  ```bash
  opencode --version
  ```
  Nếu chưa có, cài theo hướng dẫn tại https://opencode.ai/docs
- Node.js + npm (chỉ cần khi build từ source)
- Windows/macOS/Linux. Nút **Start with Proxy** chỉ có trên Windows.

### 2. Cài extension

#### Cách A — Tải VSIX từ GitHub Releases (nhanh nhất)

1. Mở: https://github.com/mducng6976/opencode_webui/releases
2. Tải file `opencode-sidebar-*.vsix` của bản mới nhất
3. Cài:
   ```bash
   code --install-extension opencode-sidebar-<version>.vsix --force
   ```
   Hoặc trong VS Code: `Ctrl+Shift+X` → `...` → **Install from VSIX...**
4. `Ctrl+Shift+P` → **Developer: Reload Window**

#### Cách B — Build từ source

```bash
git clone https://github.com/mducng6976/opencode_webui.git
cd opencode_webui
npm install
npm run compile
npx vsce package
code --install-extension opencode-sidebar-*.vsix --force
```

> VSIX không được commit vào repo (đã nằm trong `.gitignore`). Workflow GitHub Actions sẽ tự build và đính kèm VSIX vào mỗi GitHub Release khi bạn push tag `v*`.

### 3. Cấu hình

Mở **Settings** và tìm `opencode-sidebar`, hoặc sửa `settings.json`:

```jsonc
{
  "opencode-sidebar.servers": [
    {
      "id": "default",
      "url": "http://localhost:4096",
      "label": "Local Server",
      "isDefault": true,
      "serverCommand": "opencode serve --port 4096"
    }
  ],
  "opencode-sidebar.proxyOnCommand": "proxy-on",
  "opencode-sidebar.proxyShell": "powershell.exe"
}
```

- `proxyOnCommand`: lệnh bật proxy, chạy trước khi start server (mặc định `proxy-on`).
- `proxyShell`: `powershell.exe` hoặc `pwsh.exe` nếu `proxy-on` nằm trong profile PowerShell 7.

### 4. Sử dụng

1. `Ctrl+Shift+O` để mở panel OpenCode.
2. Nếu server chưa chạy, bấm:
   - **Start OpenCode Web Server** — chạy `opencode serve` ẩn.
   - **Start with Proxy** — mở cửa sổ PowerShell, chạy `proxy-on` rồi mới chạy `opencode serve`.
3. Nếu bạn tự chạy server bên ngoài:
   ```bash
   opencode serve --port 4096
   ```
   Copy dòng `server password ...`, rồi chạy command **OpenCode: Set Server Password** với username `opencode`.

### 5. Troubleshooting

| Lỗi | Cách xử lý |
|-----|-----------|
| `OpenCode server is not reachable` | Bấm **Start OpenCode Web Server** hoặc **Start with Proxy** |
| `opencode` is not recognized | Thêm `opencode` vào PATH, hoặc đặt `serverCommand` thành đường dẫn đầy đủ, ví dụ `C:\npm-global\opencode.cmd serve --port 4096` |
| Panel hiện **Connect to a server** | Password chưa đúng. Chạy **OpenCode: Set Server Password** (username `opencode`), rồi **Refresh** |
| Bấm Start with Proxy không thấy cửa sổ | Kiểm tra `proxyShell`; thử `pwsh.exe` nếu dùng PowerShell 7 |
| Không rõ lỗi | Mở **Output → OpenCode Sidebar** xem log `[server]` |

## Contributing

PRs are welcome! If you'd like to contribute, please open an issue first to discuss the change.

### Development

1. Clone the repo and run `npm install`:
   ```bash
   git clone https://github.com/mducng6976/opencode_webui.git
   cd opencode_webui
   npm install
   ```
2. Open the project in VS Code.
3. Press `F5` to launch a new Extension Development Host window.
4. Run `npm run compile` to rebuild after editing TypeScript files, or `npm run watch` for auto-recompilation.
5. Check the **OpenCode Sidebar** output channel (View → Output) for debug logs.

### Release

Push a tag that matches the version in `package.json`:

```bash
git tag v0.22.0
git push origin v0.22.0
```

GitHub Actions (`.github/workflows/release.yml`) will:

1. Install dependencies
2. Run `npm test`
3. Build `opencode-sidebar-<version>.vsix`
4. Create a GitHub Release and attach the VSIX

The workflow fails if the tag does not match `package.json`'s version.

