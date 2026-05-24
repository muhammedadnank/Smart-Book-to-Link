<p align="center">
  <img src="./assets/logo.png" alt="PageStream Logo" width="160" style="border-radius: 32px; box-shadow: 0 16px 48px rgba(168,85,247,0.4)">
</p>

<h1 align="center">✨ PageStream</h1>
<p align="center">
  <i>The ultimate premium Telegram File-to-Link streamer. Featuring a gorgeous glassmorphic UI, high-fidelity audio player, interactive in-browser eBook reader, and a resilient self-healing streaming engine.</i>
</p>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.13%2B-1e293b?style=for-the-badge&logo=python&logoColor=6366f1" alt="Python 3.13+"></a>
  <a href="https://docs.kurigram.icu/"><img src="https://img.shields.io/badge/Kurigram-Latest-1e293b?style=for-the-badge&logo=telegram&logoColor=a855f7" alt="Kurigram"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/muhammedadnank/Smart-Book-to-Link?style=for-the-badge&color=10b981" alt="License"></a>
  <a href="https://github.com/muhammedadnank/Smart-Book-to-Link/tree/main"><img src="https://img.shields.io/badge/branch-main-1e293b?style=for-the-badge&logo=git&logoColor=34d399" alt="Branch: main"></a>
  <a href="https://render.com/deploy?repo=https://github.com/muhammedadnank/Smart-Book-to-Link"><img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" height="28"></a>
</p>

---

## 🌟 Premium Features

*   **📚 Ultimate In-Browser Reader**: Native support for `.pdf`, `.epub`, `.txt`, `.fb2`, `.djvu`, and `.cbz` files. Enjoy paginated flows, custom themes (light/dark/sepia), dynamic font scaling, and TOC generation directly in the browser—all powered by a fast, modular **Jinja2 template architecture**.
*   **🎧 Atmospheric Audio Player**: High-fidelity web playback for audiobooks and music powered by **Vidstack**. Complete with interactive vinyl animations, a responsive mini-player (PiP), external app routing, and dynamic mobile-optimized UI.
*   **⚡ High-Performance Engine**: Built on asynchronous Python (`aiohttp` + `Kurigram`), utilizing connection pooling, indexed database queries, **in-memory message caching** (30-min TTL), and optimized streaming buffers.
*   **🔁 Self-Healing Connection Watchdog**: Automatically monitors all bot clients every 5 minutes. If connections drop and fail 3 consecutive checks, the service performs an emergency restart — zero manual intervention required.
*   **🚀 CDN / Workers URL Fallback**: Optionally configure up to 3 Cloudflare Workers or CDN endpoints. PageStream randomly distributes fast-download links across them for maximum throughput and redundancy.
*   **🎨 Stunning Glassmorphic UI**: Beautiful, modern neon design system with smooth micro-animations, particle effects, and dynamic gradients.
*   **🔒 Strict Security**: Features per-user rate limiting (anti-spam protection), secure time-limited token generation (`TOKEN_ENABLED`), and channel join requirements.
*   **🛡️ Secure Web Dashboard**: A fully responsive web dashboard to monitor system stats, manage files, and view live server logs.
*   **🔄 Multi-Token Load Balancing**: Deploy multiple bot clients simultaneously to bypass Telegram API limits during heavy traffic.

---

## 📑 Table of Contents

1. [About The Project](#-about-the-project)
2. [How It Works](#-how-it-works)
3. [Supported Formats](#-supported-formats)
4. [Advanced Media Viewers](#-advanced-media-viewers)
5. [Configuration Guide](#-configuration-guide)
6. [Commands Reference](#-commands-reference)
7. [Deployment Guide](#-deployment-guide)

---

## 📖 About The Project

**PageStream** transforms your Telegram document uploads into clean, high-speed HTTP(S) streamable links. By heavily leveraging modern browser APIs, the bot serves as an entire library management system—allowing users to read eBooks, manga, and listen to audiobooks instantly across all devices without requiring third-party applications.

### 💡 Ideal For

| Audience | Use Case |
| :--- | :--- |
| **📖 E-Readers & Manga Fans** | Read standard books (EPUB, PDF, FB2, TXT, DjVu) or Manga (CBZ) right in Safari/Chrome. |
| **🎧 Audiobook Listeners** | Stream massive audiobook files with speed/pitch controls, mini-player support, and background play. |
| **📁 Archival Channels** | Create custom link hubs for community courses, files, and documents. |
| **🚀 Power Users** | Bypass Telegram's strict local download limitations and stream files concurrently via CDN fallbacks. |

---

## ⚙️ How It Works

```
User Uploads File → Bot Validates Format → Forwards to BIN_CHANNEL → Returns Streaming Link
                                                                    ↘ Optional: CDN Fast Link
```

1.  **Format Validation**: Files are checked on-the-fly. Unsupported extensions are instantly rejected with clean visual cards.
2.  **Persistent Storage**: Files are saved securely in your private Telegram `BIN_CHANNEL` which acts as the source host.
3.  **In-Memory Caching**: Resolved Telegram message objects are cached in RAM (30-min TTL) to eliminate redundant API calls during streaming.
4.  **Dynamic Routing**: The web server detects the accessing device/browser and redirects to either the custom eBook Reader (`ebook.html`), the Audio Player (`req.html`), or triggers a direct download.
5.  **Self-Healing**: A background watchdog continuously pings all connected clients. On repeated failures, it triggers an automatic process restart.

---

## 📂 Supported Formats

> [!IMPORTANT]
> Non-supported files (executables, videos, app packages, etc.) are blocked automatically to preserve bandwidth and keep operations clean.

| Category | File Extensions | Associated Action / Viewer |
| :--- | :--- | :--- |
| **📚 In-Browser eBooks** | `.pdf` `.epub` `.txt` `.fb2` `.djvu` `.cbz` | **Interactive eBook / Comic Reader** |
| **📲 Download-Only Books** | `.mobi` `.azw` `.azw3` `.lit` `.cbr` | Beautiful smart-prompt triggering download |
| **🎧 Audiobooks** | `.mp3` `.m4b` `.m4a` `.ogg` `.flac` `.aac` `.wav` `.opus` | **Atmospheric Audio Player** |
| **📄 Documents** | `.doc` `.docx` `.rtf` `.odt` | Document preview card + download |
| **📦 Archives** | `.zip` `.rar` `.7z` `.tar` `.gz` | Direct download redirection |

---

## 🎨 Advanced Media Viewers

### 📖 Modular eBook & Comic Reader (`ebook.html`)
The reading engine dynamically loads the correct rendering module based on the file type, keeping memory footprints low. Built with a structured Jinja2 partial system (`_js_core`, `_js_pdf`, etc.) for seamless performance.
*   **EPUBs (`epub.js`)**: Paginated text flow, Table of Contents navigation, font size adjustment, and light/dark/sepia styling.
*   **PDFs (`pdf.js`)**: Hardware-accelerated canvas grids for crisp document rendering with responsive pinch-to-zoom.
*   **FB2 & TXT (`DOMParser`)**: Instant custom XML parsing for Russian FB2 formats generating automatic TOCs, alongside native adjustable text viewers.
*   **DjVu (`djvu.js`)**: Native WASM-powered DjVu image generation.
*   **CBZ Comics (`jszip`)**: Client-side extraction of CBZ archives on-the-fly, displaying images sequentially as a continuous web-comic stream.

### 🎧 Atmospheric Audio Player (`req.html`)
*   Fully responsive, mobile-first audio control card featuring play, pause, seek, mute, volume, and playback speed adjustments.
*   Powered by **Vidstack** for robust media handling and accessibility.
*   Vinyl records animation that dynamically glows and spins only when audio is actively playing.
*   **Mini Player (PiP)** mode for unobtrusive listening while browsing.
*   "Open In" Drawer supporting external media applications like **VLC**, **MX Player**, **Infuse**, **PotPlayer**, and **MPV** on Android, iOS, and desktop environments.

---

## 🛡️ Web Control Panel

PageStream includes a built-in, secure web dashboard accessible at `/admin`. This premium, mobile-responsive interface allows the owner to seamlessly manage operations without writing commands:
*   **Live Dashboard**: Monitor real-time CPU, RAM, active clients, uptime, and database records.
*   **File Manager & Smart Maintenance**: View all indexed files, one-click delete specific links, and run automated cleanups (clear expired tokens and files older than 5 days).
*   **User Management**: Instantly view the status of all registered users and manage access.
*   **Live Server Logs**: View real-time terminal logs directly in your browser.

*Note: Access to the dashboard is protected by a session cookie and requires the `ADMIN_PASSWORD` defined in your environment variables.*

---

## 🛠️ Configuration Guide

Rename `config_sample.env` to `config.env` and fill in the parameters:

### Essential Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `API_ID` | Telegram API ID from [my.telegram.org](https://my.telegram.org) | `12345678` |
| `API_HASH` | Telegram API Hash from [my.telegram.org](https://my.telegram.org) | `abc123def456` |
| `BOT_TOKEN` | Bot token from [@BotFather](https://t.me/BotFather) | `12345:AbCdEf...` |
| `BIN_CHANNEL` | Private storage channel ID (must start with `-100`) | `-1001234567890` |
| `OWNER_ID` | Telegram User ID of the primary admin | `987654321` |
| `DATABASE_URL` | MongoDB Atlas database connection string | `mongodb+srv://...` |
| `FQDN` | Host name of your deployment (no `https://` prefix) | `pagestream.onrender.com` |
| `PORT` | Local network port to bind the server | `8080` |

### Optional Variables

<details>
<summary>⚙️ View Optional Variables</summary>

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NAME` | Application name identifier | `PageStreamF2L` |
| `FORCE_CHANNEL_ID` | Requires users to join this channel before getting links | *(empty)* |
| `RATE_LIMIT_ENABLED` | Limits user requests per minute to prevent spam | `False` |
| `TOKEN_ENABLED` | Restricts access to links using timed user tokens | `False` |
| `TOKEN_TTL_HOURS` | Duration in hours before a token expires | `24` |
| `SLEEP_THRESHOLD` | Flood wait threshold in seconds | `600` |
| `WORKERS` | Max asynchronous event loop worker threads | `8` |
| `ADMIN_PASSWORD` | Password to access the `/admin` web control panel | `admin` |
| `MULTI_TOKEN1` | Additional bot token to scale request handling | *(empty)* |
| `MULTI_TOKEN2` | Second auxiliary token to scale request handling | *(empty)* |
| `CONNECTION_CHECK_INTERVAL` | Seconds between connection watchdog pings | `300` |
| `WORKERS_URL` | Primary CDN / Cloudflare Workers fast-download URL | *(empty)* |
| `WORKERS_URL_2` | Secondary CDN fast-download URL | *(empty)* |
| `WORKERS_URL_3` | Tertiary CDN fast-download URL | *(empty)* |

</details>

### ⚡ CDN / Workers URL Setup

PageStream supports Cloudflare Workers or any CDN as an optional fast-download fallback, inspired by the [filestreambot](https://github.com/EL-Coders/filestreambot) pattern.

When one or more `WORKERS_URL` variables are set, each generated link will include an **⚡ Fast Download** button in addition to the standard stream and download buttons. PageStream randomly picks from the configured CDN URLs per request for load distribution.

**What is a Workers URL?**
A [Cloudflare Worker](https://workers.cloudflare.com/) is a free serverless proxy that can forward requests to your PageStream server from Cloudflare's global edge network, giving users faster downloads via a CDN. The Worker URL simply needs to proxy requests through to your `BASE_URL` — no custom code required for basic pass-through.

> [!NOTE]
> `WORKERS_URL` can also be any other CDN, reverse proxy, or alternative domain that points to the same PageStream server. It doesn't have to be Cloudflare.

```env
WORKERS_URL=https://my-worker.username.workers.dev
WORKERS_URL_2=https://cdn2.example.com
WORKERS_URL_3=https://cdn3.example.com
```

> [!TIP]
> Leave all `WORKERS_URL` variables empty to disable this feature. The bot works perfectly without them.

---

## 🤖 Commands Reference

### 👤 User Commands
*   `/start` — Initialize the bot, view welcome greeting, or validate token.
*   `/link [N]` — Generate link(s). Reply to a file with `/link` (or `/link 5` for next 5 files).
*   `/help` — Display list of supported formats and usage guidelines.
*   `/ping` — Measure bot interaction latency.
*   `/about` — View info, version, and developer details.
*   `/dc` — Query the Telegram datacenter hosting a specific file.

### 🔧 Admin Commands
*   `/status` — Show system stats (CPU, memory load, network, uptime).
*   `/stats` — View total database metrics (total users, total links).
*   `/ban` / `/unban` — Block or unblock users from accessing services.
*   `/authorize` / `/deauthorize` — Manage permanent access for users.
*   `/broadcast` — Send an announcement message to all bot users.
*   `/log` — View and fetch execution logs.
*   `/restart` — Restart the running server instance.
*   `/speedtest` — Perform a network speed check on the hosting server.

---

## 🚀 Deployment Guide

### Render (One-Click)

1.  Click the deploy button:

    [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/muhammedadnank/Smart-Book-to-Link)

2.  Fill in the required Environment Variables.
3.  Once the build succeeds, copy the public URL, set it as `FQDN` in settings, and re-trigger deployment.

---

### 🐳 Docker & Docker Compose

```bash
# 1. Clone the repository
git clone -b main https://github.com/muhammedadnank/Smart-Book-to-Link.git
cd Smart-Book-to-Link

# 2. Add configuration
cp config_sample.env config.env
nano config.env

# 3. Run with Docker Compose (Recommended)
docker-compose up -d --build

# OR Run manually without compose:
# docker build -f docker/Dockerfile -t pagestream .
# docker run -d --name pagestream --env-file config.env -p 8080:8080 pagestream
```

---

### 🖥️ Manual / Virtualenv

```bash
# 1. Clone the repository
git clone -b main https://github.com/muhammedadnank/Smart-Book-to-Link.git
cd Smart-Book-to-Link

# 2. Virtual environment setup
python3 -m venv venv
source venv/bin/activate

# 3. Dependencies installation
pip install -r requirements.txt

# 4. Start the application
cp config_sample.env config.env
nano config.env
python3 -m PageStream
```

---

## 💻 Tech Stack

*   **Core MTProto Engine**: `Kurigram` (Modern Pyrogram branch) + `tgcrypto`
*   **Web Framework**: `aiohttp` + `Jinja2` dynamic modular partials
*   **Database Client**: `pymongo`
*   **Event Loop**: `uvloop`
*   **Performance Monitoring**: `psutil`
*   **Media Readers**: `epub.js`, `pdf.js`, `jszip`, `djvu.js`, Native DOM Parsing, `Vidstack`

---

## 📄 License

Distributed under the Apache License 2.0. See [LICENSE](LICENSE) for more details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/muhammedadnank">muhammedadnank</a><br>
  <b>⭐ Star this repository if you find it helpful!</b>
</p>
