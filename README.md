<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/fyaz05/Resources@main/FileToLink/logo.png" alt="Smart Book to Link Logo" width="130" style="border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.4)">
  <h1 align="center">📚 Smart Book to Link</h1>
  <p align="center"><i>High-Performance Telegram Streamer & Reader for eBooks, Audiobooks, Documents & Archives</i></p>
</p>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.13%2B-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.13+"></a>
  <a href="https://github.com/Mayuri-Chan/pyrofork"><img src="https://img.shields.io/badge/Pyrofork-2.3.69-e74c3c?style=for-the-badge" alt="Pyrofork"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/muhammedadnank/Smart-Book-to-Link?style=for-the-badge&color=27ae60" alt="License"></a>
  <a href="https://github.com/muhammedadnank/Smart-Book-to-Link/tree/main"><img src="https://img.shields.io/badge/branch-main%20(stable)-2ecc71?style=for-the-badge&logo=git" alt="Branch: main"></a>
  <a href="https://render.com/deploy?repo=https://github.com/muhammedadnank/Smart-Book-to-Link"><img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" height="28"></a>
</p>

---

> [!NOTE]
> **You are on the `main` branch — the stable reference build (`Smart-Book-to-Link-project`).**
> For the actively developed, feature-rich version with batch processing, rate limiting, token auth, and optimized database, see the [`master` branch](https://github.com/muhammedadnank/Smart-Book-to-Link/tree/master).

---

## 📑 Table of Contents

- [About The Project](#about-the-project)
- [Branch Overview](#branch-overview)
- [How It Works](#how-it-works)
- [Supported Formats](#supported-formats)
- [Advanced Media Viewers](#advanced-media-viewers)
- [Configuration](#configuration)
  - [Essential Variables](#essential-variables)
  - [Optional Variables](#optional-variables)
- [Commands Reference](#commands-reference)
- [Deployment Guide](#deployment-guide)
  - [Render (One-Click)](#-render-one-click)
  - [Docker](#-docker)
  - [Manual / Virtualenv](#-manual--virtualenv)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## About The Project

**Smart Book to Link** is a premium, specialized Telegram bot that transforms media files into high-speed HTTP(S) streaming links. It strictly accepts literary and archival content — eBooks, audiobooks, documents, and archives — and serves each through a purpose-built, responsive web viewer.

### 💡 Ideal For
| Audience | Use Case |
|---|---|
| 📖 E-Reading Buffs | Stream & read books directly in-browser, no app required |
| 🎧 Audiobook Listeners | Full-featured audio player with atmospheric UI |
| 📁 Resource Networks | Distribute course material, docs, and digital libraries |
| 🚀 Power Users | Ultra-fast direct links bypassing Telegram client limits |

---

## Branch Overview

| Branch | Description | Status |
|---|---|---|
| [`main`](https://github.com/muhammedadnank/Smart-Book-to-Link/tree/main) | **`Smart-Book-to-Link-project`** — stable reference build | ✅ Stable |
| [`master`](https://github.com/muhammedadnank/Smart-Book-to-Link/tree/master) | `claude v2` — optimized, feature-rich active build | 🚀 Active Dev |

**Upgrade to `master` for:**
- ⚡ Optimized async database with connection pooling and indexed queries
- 🔁 Batch `/link N` command for bulk link generation
- 🛡️ Per-user rate limiting (`RATE_LIMIT_ENABLED`)
- 🔐 Time-limited access token system (`TOKEN_ENABLED`)
- 📡 Keep-alive service for free-tier hosting platforms

---

## How It Works

```
User sends file → Bot validates format → Forwards to BIN_CHANNEL → Returns stream/download link(s)
```

1. **Format Validation** — The bot immediately checks the file extension. Unsupported formats are rejected with an informative formats card.
2. **Secure Storage** — Accepted files are forwarded to your private `BIN_CHANNEL`, creating a persistent stream source.
3. **Smart Routing** — When a link is accessed, the server detects the file type and serves the correct viewer (ebook reader, audio player, or download redirect).

---

## Supported Formats

> [!WARNING]
> Only the formats listed below are accepted. Any other type (videos, executables, app packages, etc.) is rejected with user-friendly feedback.

| Category | Extensions | Viewer / Action |
| :--- | :--- | :--- |
| **📚 eBooks** | `.pdf` `.epub` `.mobi` `.azw` `.azw3` `.djvu` `.fb2` `.lit` `.cbr` `.cbz` | Advanced **Ebook & Comic Reader** |
| **🎧 Audiobooks** | `.mp3` `.m4b` `.m4a` `.ogg` `.flac` `.aac` `.wav` `.opus` | Atmospheric **Audio Player** |
| **📄 Documents** | `.doc` `.docx` `.txt` `.rtf` `.odt` | Preview card + direct download |
| **📦 Archives** | `.zip` `.rar` `.7z` `.tar` `.gz` | Direct download redirect only |

---

## Advanced Media Viewers

### 📖 Ebook & Comic Reader (`ebook.html`)

Adapts dynamically per format:

| Format | Engine | Features |
|---|---|---|
| `.epub` | `EPUB.js` | Paginated text, light/dark/sepia themes, font size control, ToC navigation, keyboard turns |
| `.pdf` | `PDF.js` | Hardware-accelerated canvas grid, sequential page rendering |
| `.cbz` | `JSZip` (CDN) | Client-side extraction, alphabetical page sort, scroll reader |
| `.mobi` / `.azw` | — | Professional download handshake card with e-reader setup guide |

### 🎧 Atmospheric Audio Player (`req.html`)

- Full playback controls with seek bar and duration display
- Responsive layout — desktop & mobile optimized
- Atmospheric animated backdrop that reacts to player state
- Metadata display (filename, format, file size)

---

## Configuration

Copy `config_sample.env` → `config.env` and fill in your values.

### Essential Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `API_ID` | Telegram API ID from [my.telegram.org](https://my.telegram.org) | `12345678` |
| `API_HASH` | Telegram API Hash | `abc123def456` |
| `BOT_TOKEN` | Bot token from [@BotFather](https://t.me/BotFather) | `123456:ABCdef` |
| `BIN_CHANNEL` | Private channel ID for file storage | `-1001234567890` |
| `OWNER_ID` | Your Telegram user ID | `12345678` |
| `DATABASE_URL` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `FQDN` | Your server domain or IP | `reader.yoursite.com` |
| `PORT` | Web server port | `8080` |

### Optional Variables

<details>
<summary>▶ View optional configuration</summary>

| Variable | Description | Default |
| :--- | :--- | :--- |
| `MULTI_TOKEN1` | Extra bot token for load balancing | *(empty)* |
| `MULTI_TOKEN2` | Second extra bot token | *(empty)* |
| `FORCE_CHANNEL_ID` | Channel users must join before using the bot | *(empty)* |
| `RATE_LIMIT_ENABLED` | Enable per-user anti-spam rate limiting | `False` |
| `TOKEN_ENABLED` | Enable time-limited access tokens | `False` |
| `TOKEN_TTL_HOURS` | Token validity in hours | `24` |

</details>

---

## Commands Reference

### 👤 User Commands

| Command | Description |
|---|---|
| `/start` | Start the bot, view welcome message, or activate a time token |
| `/link [N]` | Generate link(s). Reply to the first file and pass count for batch mode, e.g. `/link 5` |
| `/ping` | Check bot response latency |
| `/help` | Show usage guide and accepted formats |

### 🔧 Admin Commands

| Command | Description |
|---|---|
| `/status` | Server health — CPU, RAM, uptime |
| `/stats` | Database analytics — total users, total links |
| `/ban` / `/unban` | Block / unblock a user |
| `/authorize` / `/deauthorize` | Grant / revoke permanent access |
| `/broadcast` | Send a message to all users |
| `/log` | Fetch the latest server execution log |

---

## Deployment Guide

### 🚀 Render (One-Click)

1. Click below to deploy:

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/muhammedadnank/Smart-Book-to-Link)

2. Set the required environment variables: `API_ID`, `API_HASH`, `BOT_TOKEN`, `OWNER_ID`, `BIN_CHANNEL`, `DATABASE_URL`.
3. After first deploy, copy your Render URL (e.g. `your-app.onrender.com`), set it as `FQDN`, and re-deploy.

---

### 🐳 Docker

```bash
# 1. Clone the main branch
git clone -b main https://github.com/muhammedadnank/Smart-Book-to-Link.git
cd Smart-Book-to-Link

# 2. Configure environment
cp config_sample.env config.env
nano config.env   # fill in your values

# 3. Build & run
docker build -t smartbook .
docker run -d --name smartbook --env-file config.env -p 8080:8080 smartbook
```

---

### 🖥️ Manual / Virtualenv

```bash
# 1. Clone the main branch
git clone -b main https://github.com/muhammedadnank/Smart-Book-to-Link.git
cd Smart-Book-to-Link

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install pinned dependencies
pip install -r requirements.txt

# 4. Configure and run
cp config_sample.env config.env
nano config.env
python3 -m Thunder
```

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Telegram MTProto | `pyrofork` | 2.3.69 |
| Crypto | `tgcrypto` | 1.2.5 |
| Web Server | `aiohttp` | 3.11.18 |
| Templates | `Jinja2` | 3.1.6 |
| Database | `pymongo` | 4.17.0 |
| Config | `python-dotenv` | 1.2.2 |
| System Stats | `psutil` | 7.2.2 |
| Event Loop | `uvloop` | 0.21.0 |
| Speed Test | `speedtest-cli` | 2.1.3 |
| Scraping | `cloudscraper` | 1.2.71 |

---

## License

This project is licensed under the [Apache License 2.0](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/muhammedadnank">muhammedadnank</a><br>
  <b>⭐ Star this project if you find it useful!</b>
</p>
