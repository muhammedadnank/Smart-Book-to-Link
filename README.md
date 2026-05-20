<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/fyaz05/Resources@main/FileToLink/logo.png" alt="PageStream Logo" width="120" style="border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.5)">
</p>

<h1 align="center">📄 PageStream</h1>
<p align="center">
  <i>A premium, high-performance Telegram File-to-Link bot equipped with interactive in-browser eBook readers, atmospheric audiobooks player, and direct media streaming.</i>
</p>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.13%2B-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.13+"></a>
  <a href="https://github.com/Mayuri-Chan/pyrofork"><img src="https://img.shields.io/badge/Pyrofork-2.3.69-e74c3c?style=for-the-badge" alt="Pyrofork"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/muhammedadnank/Smart-Book-to-Link?style=for-the-badge&color=27ae60" alt="License"></a>
  <a href="https://github.com/muhammedadnank/Smart-Book-to-Link/tree/main"><img src="https://img.shields.io/badge/branch-main%20(stable)-2ecc71?style=for-the-badge&logo=git" alt="Branch: main"></a>
  <a href="https://render.com/deploy?repo=https://github.com/muhammedadnank/Smart-Book-to-Link"><img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" height="28"></a>
</p>

---

### 🌟 Key Features

*   **📚 In-Browser eBook Reader**: Open and read `.pdf`, `.epub`, and `.cbz` files seamlessly inside your browser with customizable light/sepia/dark themes.
*   **🎧 Atmospheric Audio Player**: High-fidelity web playback for audiobooks and music, complete with interactive vinyl animations and responsive controls.
*   **⚡ High Performance**: Powered by asynchronous Python (`aiohttp` + `pyrofork`), utilizing connection pooling, indexed database queries, and optimized buffers.
*   **🔒 Strict Security**: Features per-user rate limiting (anti-spam protection), secure time-limited token generation (`TOKEN_ENABLED`), and channel join requirements.
*   **🔄 Multi-Token Load Balancing**: Deploy multiple bot clients simultaneously to bypass Telegram API limits during heavy traffic.
*   **🔁 Batch Generation**: Generate up to N streaming links concurrently in a single command.

---

## 📑 Table of Contents

1. [About The Project](#about-the-project)
2. [How It Works](#how-it-works)
3. [Supported Formats](#supported-formats)
4. [Advanced Media Viewers](#advanced-media-viewers)
5. [Configuration Guide](#configuration-guide)
    * [Essential Variables](#essential-variables)
    * [Optional Variables](#optional-variables)
6. [Commands Reference](#commands-reference)
7. [Deployment Guide](#deployment-guide)
    * [Render (One-Click)](#-render-one-click)
    * [Docker](#-docker)
    * [Manual / Virtualenv](#-manual--virtualenv)
8. [Tech Stack](#tech-stack)
9. [License](#license)

---

## About The Project

**PageStream** is designed to transform Telegram document uploads into clean, high-speed HTTP(S) streamable links. It targets literary, document, and archival files, ensuring that your books, audiobooks, and documents are instantly readable or playable on any device without downloading external files or leaving the web environment.

### 💡 Ideal For

| Audience | Use Case |
| :--- | :--- |
| **📖 E-Readers** | Read books & manga instantly in-browser on mobile or desktop |
| **🎧 Audiobook Fans** | Listen to audio tracks with advanced playback speed and seek controls |
| **📁 Libraries & Channels** | Distribute course resources, archives, and files with speed |
| **🚀 Power Users** | Stream media files immediately, bypassing local client constraints |

---

## How It Works

```
User uploads file → Bot validates format → Forwards to BIN_CHANNEL → Returns streaming / reader link
```

1.  **Format Validation**: Files are checked on-the-fly. Unsupported extensions are instantly rejected with clean visual cards.
2.  **Persistent Storage**: Files are saved securely in your private Telegram `BIN_CHANNEL` which acts as the source host.
3.  **Dynamic Routing**: The web server detects the accessing device/browser and redirects to either the custom eBook Reader (`ebook.html`), the Audio Player (`req.html`), or direct download.

---

## Supported Formats

> [!IMPORTANT]
> Non-supported files (executables, videos, app packages, etc.) are blocked automatically to preserve bandwidth and clean operations.

| Category | File Extensions | Associated Action / Viewer |
| :--- | :--- | :--- |
| **📚 eBooks** | `.pdf` `.epub` `.mobi` `.azw` `.azw3` `.djvu` `.fb2` `.lit` `.cbr` `.cbz` | **Interactive eBook / Comic Reader** |
| **🎧 Audiobooks** | `.mp3` `.m4b` `.m4a` `.ogg` `.flac` `.aac` `.wav` `.opus` | **Atmospheric Audio Player** |
| **📄 Documents** | `.doc` `.docx` `.txt` `.rtf` `.odt` | Document preview card + download |
| **📦 Archives** | `.zip` `.rar` `.7z` `.tar` `.gz` | Direct download redirection |

---

## Advanced Media Viewers

### 📖 eBook & Comic Reader (`ebook.html`)
*   **EPUBs**: Powered by `EPUB.js` featuring paginated text flow, Table of Contents navigation, font size adjustment, and light/dark/sepia styling.
*   **PDFs**: Uses `PDF.js` rendering with hardware-accelerated canvas grids for crisp rendering.
*   **CBZ Comics**: Uses client-side `JSZip` to extract pages on-the-fly, sort them alphabetically, and view as a continuous web-comic stream.

### 🎧 Atmospheric Audio Player (`req.html`)
*   Fully responsive audio control card featuring play, pause, seek, mute, volume, and playback speed adjustments.
*   Vinyl records animation that spins only when audio is actively playing.
*   "Open In" Drawer supporting external media applications like **VLC**, **MX Player**, **Infuse**, **PotPlayer**, and **MPV** on Android, iOS, and desktop environments.

---

## Configuration Guide

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
| `MULTI_TOKEN1` | Additional bot token to scale request handling | *(empty)* |
| `MULTI_TOKEN2` | Second auxiliary token to scale request handling | *(empty)* |

</details>

---

## Commands Reference

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

## Deployment Guide

### 🚀 Render (One-Click)

1.  Click the deploy button:

    [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/muhammedadnank/Smart-Book-to-Link)

2.  Fill in the required Environment Variables.
3.  Once the build succeeds, copy the public URL, set it as `FQDN` in settings, and re-trigger deployment.

---

### 🐳 Docker

```bash
# 1. Clone the repository
git clone -b main https://github.com/muhammedadnank/Smart-Book-to-Link.git
cd Smart-Book-to-Link

# 2. Add configuration
cp config_sample.env config.env
nano config.env

# 3. Run container
docker build -t pagestream .
docker run -d --name pagestream --env-file config.env -p 8080:8080 pagestream
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

## Tech Stack

*   **Core MTProto Engine**: `pyrofork` + `tgcrypto`
*   **Web Framework**: `aiohttp`
*   **Templates**: `Jinja2`
*   **Database Client**: `pymongo`
*   **Event Loop**: `uvloop`
*   **Performance Monitoring**: `psutil`
*   **Security & Encryption**: Built-in time hashes and tokens

---

## License

Distributed under the Apache License 2.0. See [LICENSE](LICENSE) for more details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/muhammedadnank">muhammedadnank</a><br>
  <b>⭐ Star this repository if you find it helpful!</b>
</p>
