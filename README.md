<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/fyaz05/Resources@main/FileToLink/logo.png" alt="Smart Book to Link Logo" width="120" style="border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.3)">
  <h1 align="center">📚 Smart Book to Link</h1>
</p>

<p align="center">
  <b>High-Performance Specialized Telegram Streamer & Reader for eBooks, Audiobooks, Documents & Archives</b>
</p>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/python-3.13%2B-blue?style=for-the-badge&logo=python" alt="Python Version"></a>
  <a href="https://github.com/Mayuri-Chan/pyrofork"><img src="https://img.shields.io/badge/Pyrofork-red?style=for-the-badge" alt="Pyrofork"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/muhammedadnank/Smart-Book-to-Link?style=for-the-badge&color=green" alt="License"></a>
  <a href="https://render.com/deploy?repo=https://github.com/muhammedadnank/Smart-Book-to-Link"><img src="https://render.com/images/deploy-to-render.svg" alt="Deploy to Render"></a>
</p>

<hr>

## 📑 Table of Contents

- [About The Project](#about-the-project)
- [How It Works](#how-it-works)
- [Strict Category Rules](#strict-category-rules)
- [Advanced Media Viewers](#advanced-media-viewers)
- [Configuration](#configuration)
  - [Essential Configuration](#essential-configuration)
  - [Optional Configuration](#optional-configuration)
- [Usage and Commands](#usage-and-commands)
  - [Commands Reference](#commands-reference)
- [Deployment Guide](#deployment-guide)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Support & Community](#support--community)
- [License](#license)

<hr>

## About The Project

**Smart Book to Link** is a premium, specialized Telegram streamer and reader bot designed exclusively for literature, documents, audiobooks, and zip/rar archives. It transforms Telegram media files into high-speed, direct HTTP(S) links, matching them instantly with custom, responsive, and gorgeous web-based viewers.

### 💡 Ideal For
- 📖 **E-Reading Buffs**: Stream, read, and flip through books directly in your browser.
- 🎧 **Audiobook Listeners**: Stream complete audiobooks in a responsive, gorgeous web audio player.
- 📁 **Resource Networks**: Distribute archived course material, documentation, and digital libraries.
- 🚀 **Bypassing Limitations**: Enjoy ultra-high-speed download links bypassing standard Telegram client limits.

---

## How It Works

```
User Uploads File → Bot Evaluates Format Category → Store in BIN_CHANNEL → Generate Stream/Download Links
```

1. **Category Check**: The bot immediately validates the incoming file format. Non-literary or unsupported files are rejected gracefully with a visual formats card.
2. **Secure Storing**: Valid files are forwarded to your private storage channel (`BIN_CHANNEL`) to generate secure persistent stream channels.
3. **Smart Routing**: When a link is clicked, the server dynamically detects the file category and serves the correct advanced client-side viewer or initiates direct download.

---

## Strict Category Rules

To keep the platform optimized and dedicated, the bot only accepts the following file formats:

| Category | Allowed Extensions | Action on Streaming |
| :--- | :--- | :--- |
| **📚 eBooks** | `.pdf, .epub, .mobi, .azw, .azw3, .djvu, .fb2, .lit, .cbr, .cbz` | Opens in the advanced **Ebook / Comic Reader** |
| **🎧 Audiobooks** | `.mp3, .m4b, .m4a, .ogg, .flac, .aac, .wav, .opus` | Opens in the responsive **Atmospheric Audio Player** |
| **📄 Documents** | `.doc, .docx, .txt, .rtf, .odt` | Serves direct preview or download card |
| **📦 Archives** | `.zip, .rar, .7z, .tar, .gz` | Strictly serves direct download redirection only |

> [!WARNING]
> Any other format (like arbitrary videos, application packages, or executables) is rejected with clear user feedback.

---

## Advanced Media Viewers

### 📖 1. The Ultimate Ebook & Comic Reader
Our premium reader interface (`ebook.html`) adapts dynamically to the target book format:
* **EPUB Paginated Reader**: Uses `EPUB.js` to render beautifully stylized text. Supports light, dark, and warm sepia themes, adjustable font sizes, full Table of Contents navigation, and keyboard page turns.
* **PDF Canvas Viewer**: Uses `PDF.js` to render high-performance, sequential canvas page grids with hardware-accelerated rendering.
* **Client-Side Comic Viewer (.cbz)**: Automatically loads `JSZip` client-side from CDN, extracts comic book zip files on-the-fly, sorts pages alphabetically, and renders sequential, optimized scroll sheets.
* **Offline Ebook Handshake**: For offline optimized ebook formats (like `.mobi` and `.azw`), it renders a professional handshake card indicating download status and e-reader setup.

### 🎧 2. Atmospheric Responsive Audio Player
Our audio streamer (`req.html`) uses high-fidelity audio controls:
* Displays detailed metadata and duration.
* Responsive layouts optimized for both desktop and mobile viewports.
* Atmospheric backdrops adapting to the player state.

---

## Configuration

Copy `config_sample.env` to `config.env` and customize the variables.

### Essential Configuration

| Variable | Description | Example |
| :--- | :--- | :--- |
| `API_ID` | Telegram API ID | `12345678` |
| `API_HASH` | Telegram API Hash | `abc123def456` |
| `BOT_TOKEN` | Bot token from @BotFather | `123456:ABCdefGHI` |
| `BIN_CHANNEL` | Private storage channel ID | `-1001234567890` |
| `OWNER_ID` | Owner user ID | `12345678` |
| `DATABASE_URL` | MongoDB connection | `mongodb+srv://...` |
| `FQDN` | Domain/IP address | `reader.yoursite.com` |
| `PORT` | Web server port | `8080` |

### Optional Configuration

<details>
<summary>View Optional Configuration Details</summary>

| Variable | Description | Default |
| :--- | :--- | :--- |
| `MULTI_TOKEN1` | Additional bot tokens for load balancing | *(empty)* |
| `FORCE_CHANNEL_ID` | ID of channel users must join before using | *(empty)* |
| `RATE_LIMIT_ENABLED` | Enable anti-spam rate limiting | `False` |
| `TOKEN_ENABLED` | Enable time-limited authentication tokens | `False` |
| `TOKEN_TTL_HOURS` | Token validity duration in hours | `24` |

</details>

---

## Usage and Commands

### Commands Reference

#### User Commands
* `/start` - Start the bot, get the custom welcome message, or activate a time token.
* `/link` - Convert files to links. For batching, **reply to the first file** of the series and specify count (e.g. `/link 5`).
* `/ping` - Check response latency.
* `/help` - Show usage instructions and allowed format guidelines.

#### Admin Commands
* `/status` - Monitor server CPU, RAM, and uptime.
* `/stats` - View database analytics and total link history.
* `/ban` / `/unban` - Restrict users from the bot ecosystem.
* `/authorize` / `/deauthorize` - Manage permanent user access.
* `/log` - Fetch server execution logs.

---

## Deployment Guide

### Prerequisites
- **Python 3.13+**
- **MongoDB Database**
- **Telegram API Credentials** (from [my.telegram.org](https://my.telegram.org))
- **Dedicated VPS or Cloud Platform**

### Installation

#### 🚀 Render Deployment (One-Click)

1. Click the button below:
   [![Deploy to Render](https://render.com/images/deploy-to-render.svg)](https://render.com/deploy?repo=https://github.com/muhammedadnank/Smart-Book-to-Link)
2. Fill in the required environment variables:
   * `API_ID`, `API_HASH`, `BOT_TOKEN`, `OWNER_ID`, `BIN_CHANNEL`, and `DATABASE_URL`.
   * For `FQDN`, copy the generated Render URL (e.g. `your-app.onrender.com`) after the deployment finishes, paste it in, and re-deploy.
3. Click **Apply Resources** to deploy!

#### Docker Deployment (Recommended)
```bash
# 1. Clone the project
git clone https://github.com/muhammedadnank/Smart-Book-to-Link.git
cd Smart-Book-to-Link

# 2. Configure environment
cp config_sample.env config.env
nano config.env

# 3. Build & Run
docker build -t smartbook .
docker run -d --name smartbook -p 8080:8080 smartbook
```

#### Manual Virtualenv Setup
```bash
# 1. Initialize environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run server
python3 -m Thunder
```

---

## License

This project is licensed under the [Apache License 2.0](LICENSE). 

---

<p align="center">
  <b>⭐ Star this project if you find it useful!</b>
</p>
