<p align="center">
  <img src="./assets/logo.png" alt="PageStream Logo" width="160" style="border-radius: 32px; box-shadow: 0 16px 48px rgba(168,85,247,0.4)">
</p>

<h1 align="center">✨ PageStream</h1>
<p align="center">
  <i>The ultimate premium Telegram File-to-Link streamer. Featuring a gorgeous glassmorphic React SPA interface, high-fidelity audio player, interactive in-browser eBook reader, secure admin dashboard, and a resilient self-healing streaming engine.</i>
</p>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.13%2B-1e293b?style=for-the-badge&logo=python&logoColor=6366f1" alt="Python 3.13+"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.0-1e293b?style=for-the-badge&logo=react&logoColor=61dafb" alt="React 19"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-8.0-1e293b?style=for-the-badge&logo=vite&logoColor=a855f7" alt="Vite 8"></a>
  <a href="https://docs.kurigram.icu/"><img src="https://img.shields.io/badge/Kurigram-Latest-1e293b?style=for-the-badge&logo=telegram&logoColor=a855f7" alt="Kurigram"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/muhammedadnank/Smart-Book-to-Link?style=for-the-badge&color=10b981" alt="License"></a>
  <a href="https://github.com/muhammedadnank/Smart-Book-to-Link/tree/main"><img src="https://img.shields.io/badge/branch-main-1e293b?style=for-the-badge&logo=git&logoColor=34d399" alt="Branch: main"></a>
  <a href="https://render.com/deploy?repo=https://github.com/muhammedadnank/Smart-Book-to-Link"><img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" height="28"></a>
</p>

---

## 📖 Table of Contents

1. [Flexible Frontend Deployment Architectures](#-flexible-frontend-deployment-architectures)
2. [Premium Features](#-premium-features)
3. [Technology Stack](#-technology-stack)
4. [Supported Formats](#-supported-formats)
5. [Database Architecture (MongoDB Schema)](#-database-architecture-mongodb-schema)
6. [API Endpoint Reference](#-api-endpoint-reference)
7. [Developer Guide: React SPA](#-developer-guide-react-spa)
8. [Configuration Guide](#-configuration-guide)
9. [Telegram Commands Reference](#-telegram-commands-reference)
10. [Deployment Guide](#-deployment-guide)
11. [License](#-license)

---

## 🌐 Flexible Frontend Deployment Architectures

PageStream is designed to support two distinct deployment architectures based on your preference:

```
                      +-----------------------------+
                      | Incoming Stream/Admin Req   |
                      +--------------+--------------+
                                     |
                         Is FRONTEND_URL configured?
                                     |
                    +----------------+----------------+
                    | Yes (Option B)                  | No (Option A)
                    v                                 v
      +-----------------------------+   +-----------------------------+
      |  ⚡ Bifurcated Deployment    |   |  📦 Monolithic Deployment    |
      | - Frontend: Vercel SPA      |   | - Frontend: Local Dist SPA  |
      | - Backend: Render Bot/API   |   | - Backend: Render Bot/API   |
      | - Automatic API Proxying    |   | - Serves static SPA locally |
      +-----------------------------+   +-----------------------------+
```

*   **Option A: Monolithic Single-Host (Default)**: The React 19 SPA is compiled locally (`frontend/dist/`) and served directly by the Python web server. Useful for VPS/Docker deployments where you want a single unified service.
*   **Option B: Bifurcated Dual-Host (Recommended)**: The React SPA is hosted separately on Vercel/Netlify for instant delivery and edge caching, while the main bot and JSON API backend resides on Render or a VPS. Set the `FRONTEND_URL` environment variable to automatically redirect all stream and admin requests to the external host.

---

## 🌟 Premium Features

*   **📚 Ultimate In-Browser eBook Reader**: Supports paginated reading, customized themes (light, dark, sepia), canvas zoom controls, page memory, and automatic Table of Contents parsing.
*   **🎧 Atmospheric Audio Player**: High-fidelity media streaming with specialized vinyl animations that spin/glow on-play. Supports speed controls, mini-player (PiP), and external route handlers (open in VLC, MX Player, PotPlayer, etc.).
*   **⚡ Load-Balanced Multi-Client Engine**: Spawn multiple bot instances simultaneously via environment tokens (`MULTI_TOKEN1`, `MULTI_TOKEN2`, etc.) to distribute streaming loads and bypass Telegram API download speed limitations.
*   **🔁 Self-Healing Connection Watchdog**: Monitors bot clients every 5 minutes. If a client drops offline and fails 3 consecutive pings, PageStream triggers an emergency restart to restore services.
*   **🚀 CDN / Workers Fast Links**: Configure up to 3 alternative fast-download CDNs or Cloudflare Workers. PageStream automatically distributes requests across them for high throughput.
*   **🔒 Granular Access Controls**: Features per-user rate limiting, anti-spam window queues, channel join requirements (Force Subscribe), and timed verification tokens.
*   **🛡️ Secure Web Control Panel**: Features real-time CPU/RAM stats, database metrics, user ban/authorization controls, file query/management, and streamable server logs.

---

## 💻 Technology Stack

### Backend Engine
*   **Language**: Python 3.13+
*   **Core MTProto Engine**: `Kurigram` (Optimized asynchronous Pyrogram fork) + `tgcrypto`
*   **Web Framework**: `aiohttp` + `Jinja2` (Legacy Templates)
*   **Database Client**: `pymongo` (Motor async adapter)
*   **Event Loop**: `uvloop` (for high-concurrency socket performance)
*   **Performance Monitoring**: `psutil`

### Frontend SPA
*   **Framework**: React 19 + Vite 8
*   **Router**: React Router 7 (Single-Page routing)
*   **Styling**: Vanilla CSS (Tailored glassmorphism and modern UI system)
*   **Icons**: Lucide React
*   **Audio Core**: Vidstack Media Player

---

## 📂 Supported Formats

| Category | File Extensions | Associated Action / Viewer |
| :--- | :--- | :--- |
| **📚 In-Browser eBooks** | `.pdf` `.epub` `.txt` `.fb2` `.djvu` `.cbz` | **Interactive eBook / Comic Reader** |
| **📲 Download-Only Books** | `.mobi` `.azw` `.azw3` `.lit` `.cbr` | Smart-prompt visual download interface |
| **🎧 Audiobooks** | `.mp3` `.m4b` `.m4a` `.ogg` `.flac` `.aac` `.wav` `.opus` | **Atmospheric Audio Player** |
| **📄 Documents** | `.doc` `.docx` `.rtf` `.odt` | Document preview card + download |
| **📦 Archives** | `.zip` `.rar` `.7z` `.tar` `.gz` | Direct download redirection |

---

## 🗄️ Database Architecture (MongoDB Schema)

PageStream uses MongoDB to store configurations, access logs, verification tokens, and cached file IDs. All collections feature optimized indexing to support high-throughput operations.

### Collection Schema Definitions

#### 1. `users`
Tracks Telegram users interacting with the bot.
*   `id` (Int64, Unique Index): Telegram User ID.
*   `first_name` (String): User's first name.
*   `last_name` (String, Optional): User's last name.
*   `username` (String, Optional): Telegram username.
*   `join_date` (ISODate): Timestamp when the user first started the bot.

#### 2. `authorized_users`
Whitelist of users permitted to generate links when token security is enabled.
*   `user_id` (Int64, Unique Index): Whitelisted user's ID.
*   `authorized_by` (Int64): Owner/Admin ID who authorized the user.
*   `authorized_at` (ISODate): Timestamp of authorization.

#### 3. `banned_users`
Restricts access to bot commands and stream interfaces.
*   `user_id` (Int64, Unique Index): Banned user's ID.
*   `reason` (String): Reason for the ban.
*   `banned_at` (ISODate): Timestamp of the ban.

#### 4. `banned_channels`
List of channels restricted from requesting streams.
*   `channel_id` (Int64, Unique Index): Banned Telegram channel ID.
*   `reason` (String): Reason for restriction.
*   `banned_at` (ISODate): Timestamp of the ban.

#### 5. `tokens`
Handles timed verification tokens.
*   `token` (String, Unique Index): Unique generated session token.
*   `user_id` (Int64): Telegram user who created/activated the token.
*   `created_at` (ISODate): Generation timestamp.
*   `expires_at` (ISODate, TTL Index): Automatic deletion trigger.
*   `activated` (Boolean, Indexed): Activation status.

#### 6. `files`
Caches Telegram message locations to eliminate redundant file-lookup operations during stream downloads.
*   `file_unique_id` (String, Unique Index): Telegram unique file hash identifier.
*   `public_hash` (String, Unique Index): Custom generated hash for browser streaming URLs.
*   `canonical_message_id` (Int32, Unique Index): Message ID of the file in the storage channel.
*   `file_id` (String): Pyrogram file ID for reference.
*   `file_name` (String, Search Index): Name of the file.
*   `file_size` (Int64): Size of the file in bytes.
*   `mime_type` (String): Mime type of the file.
*   `created_at` (ISODate, Indexed): Indexed date of creation.
*   `last_seen_at` (ISODate, Indexed): Tracks file popularity.
*   `seen_count` (Int32): Tracking views / download counts.

---

## 📡 API Endpoint Reference

When running in React SPA Mode, the backend serves as a REST API provider. All admin routes require the `admin_session` cookie containing the `ADMIN_PASSWORD`.

### Authentication
*   **`POST /api/admin/login`**
    *   *Body*: `{"password": "ADMIN_PASSWORD"}`
    *   *Returns*: `{"success": true}` (Sets cookie `admin_session`)
*   **`POST /api/admin/logout`**
    *   *Returns*: `{"success": true}` (Clears cookie)

### System Performance & Metrics
*   **`GET /api/admin/stats`**
    *   *Returns*: Core metrics showing total files, active users, authorized whitelists, uptime, bot active clients, and host CPU/RAM utilization.
    *   *Example Response*:
        ```json
        {
          "total_users": 284,
          "authorized_users": 15,
          "total_files": 1205,
          "uptime": "2d 4h 12m",
          "active_clients": 3,
          "cpu": 12.4,
          "ram": 58.2
        }
        ```

### User Management
*   **`GET /api/admin/users`**
    *   *Returns*: A list of all users along with their authorization/ban flags and join dates.
*   **`POST /api/admin/users/ban`**
    *   *Body*: `{"user_id": 123456}`
    *   *Returns*: `{"success": true}`
*   **`POST /api/admin/users/unban`**
    *   *Body*: `{"user_id": 123456}`
    *   *Returns*: `{"success": true}`
*   **`POST /api/admin/users/authorize`**
    *   *Body*: `{"user_id": 123456}`
    *   *Returns*: `{"success": true}`
*   **`POST /api/admin/users/unauthorize`**
    *   *Body*: `{"user_id": 123456}`
    *   *Returns*: `{"success": true}`

### File & Maintenance Control
*   **`GET /api/admin/files`**
    *   *Query Parameters*: `q` (Search query, optional)
    *   *Returns*: Last 200 indexed files matching the query.
*   **`POST /admin/files/delete/{hash}`**
    *   *Returns*: `{"success": true}` (Deletes file index mapping)
*   **`POST /admin/maintenance/clear_unused_files`**
    *   *Returns*: `{"success": true, "deleted_count": N}` (Deletes links untouched for 5+ days)
*   **`POST /admin/maintenance/clear_tokens`**
    *   *Returns*: `{"success": true, "deleted_count": N}` (Purges expired authentication tokens)

### System Log & Metadata
*   **`GET /api/admin/logs`**
    *   *Returns*: JSON object containing the last 150 lines of the server runtime log.
*   **`GET /api/bot/info`**
    *   *Returns*: Active username of the Telegram Bot client.

---

## 🛠️ Developer Guide: React SPA

Follow this guide to develop, customize, or build the glassmorphic React interface.

### Project Structure
```
frontend/
├── src/
│   ├── components/       # Shared UI components (Modal, Cards, Alert)
│   ├── pages/            # Viewers (Audio, Ebook, Download) and Dashboard Pages
│   ├── App.jsx           # Main Routing & State setup
│   ├── index.css         # Glassmorphic UI token style system
│   └── main.jsx          # React app mount
├── index.html
├── vite.config.js        # Configures development proxies
└── package.json
```

### Local Development Setup

1.  **Start Python Backend**: Ensure the python backend server is running in dev mode on port `8080`.
2.  **Install dependencies**:
    ```bash
    cd frontend
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    *The dev environment runs at `http://localhost:5173`. Vite configuration automatically proxies API and stream calls (`/api`, `/f`, `/admin/files`, etc.) to the python server running at `http://localhost:8080` to prevent CORS issues.*

### Compiling for Production

To compile and link the React interface directly into the Python backend:
```bash
cd frontend
npm run build
```
Vite compiles all static assets into `frontend/dist/`. The backend will automatically detect the presence of `frontend/dist/index.html` on startup and switch to SPA mode.

---

## ⚙️ Configuration Guide

Rename `config_sample.env` to `config.env` and adjust variables:

### Essential Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `API_ID` | Telegram API ID from [my.telegram.org](https://my.telegram.org) | `12345678` |
| `API_HASH` | Telegram API Hash from [my.telegram.org](https://my.telegram.org) | `abc123def456` |
| `BOT_TOKEN` | Bot token from [@BotFather](https://t.me/BotFather) | `12345:AbCdEf...` |
| `BIN_CHANNEL` | Private storage channel ID (must start with `-100`) | `-1001234567890` |
| `OWNER_ID` | Telegram User ID of the primary admin | `987654321` |
| `DATABASE_URL` | MongoDB Atlas database connection string | `mongodb+srv://...` |
| `FQDN` | Domain name of deployment (no `https://` prefix) | `pagestream.onrender.com` |
| `PORT` | Local network port to bind the server | `8080` |

### Security & Rate Limiting Settings

| Variable | Description | Default |
| :--- | :--- | :--- |
| `FORCE_CHANNEL_ID` | Channel ID users must join before generating links | *(empty)* |
| `RATE_LIMIT_ENABLED` | Enables request limits to protect against spam | `False` |
| `MAX_FILES_PER_PERIOD` | Max file generation requests permitted per window | `2` |
| `RATE_LIMIT_PERIOD_MINUTES`| Duration of the rate limit window in minutes | `1` |
| `TOKEN_ENABLED` | Locks links behind timed session tokens | `False` |
| `TOKEN_TTL_HOURS` | Duration in hours before user tokens expire | `24` |
| `ADMIN_PASSWORD` | Password to access the `/admin` dashboard | `admin` |

### CDN, Performance & Multi-Client Settings

| Variable | Description | Default |
| :--- | :--- | :--- |
| `WORKERS` | Max asynchronous event loop threads | `8` |
| `SLEEP_THRESHOLD` | Flood wait recovery limit in seconds | `600` |
| `MULTI_TOKEN1` | Additional bot client token for balancing | *(empty)* |
| `MULTI_TOKEN2` | Second additional bot client token for balancing | *(empty)* |
| `WORKERS_URL` | Primary CDN / Worker proxy URL | *(empty)* |
| `WORKERS_URL_2` | Secondary CDN / Worker proxy URL | *(empty)* |
| `WORKERS_URL_3` | Tertiary CDN / Worker proxy URL | *(empty)* |
| `CONNECTION_CHECK_INTERVAL`| Watching ping interval in seconds | `300` |

---

## 🤖 Telegram Commands Reference

### 👤 Regular Users
*   `/start` — Start the bot, view welcome greeting, or validate timed token access.
*   `/link [N]` — Reply to a file with `/link` to generate stream links (or `/link 5` to process the next 5 files).
*   `/help` — Check list of supported file formats and reader details.
*   `/ping` — Check bot response latency.
*   `/about` — View app details, version, and license.
*   `/dc` — Query the Telegram datacenter hosting a specific file.

### 🔧 Administrators
*   `/status` — View real-time CPU, RAM, active clients workload, and server uptime.
*   `/stats` — View aggregate database counts (total users, indexed files).
*   `/ban` / `/unban` — Ban or unban a user from using the bot/streaming links.
*   `/authorize` / `/deauthorize` — Whitelist/remove a user from permanent token bypass.
*   `/broadcast` — Broadcast a markdown announcement message to all registered users.
*   `/log` — Fetch the application runtime log file.
*   `/restart` — Perform a safe restart of the application server.
*   `/speedtest` — Run a network speed test directly on the hosting server.

---

## 🚀 Deployment Guide

### Option A: Monolithic Single-Host (Self-Hosted SPA)

In this mode, the React SPA is served directly by the Python web server. Useful for VPS/Docker setups.

#### Docker Compose
1. Clone repository and navigate to root:
   ```bash
   git clone https://github.com/muhammedadnank/Smart-Book-to-Link.git
   cd Smart-Book-to-Link
   ```
2. Build the SPA client assets:
   ```bash
   cd frontend && npm install && npm run build && cd ..
   ```
3. Set up the environment variables:
   ```bash
   cp config_sample.env config.env
   nano config.env
   ```
4. Start with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

#### Manual Virtualenv
1. Setup Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Build the frontend assets:
   ```bash
   cd frontend && npm install && npm run build && cd ..
   ```
3. Run the streaming backend:
   ```bash
   cp config_sample.env config.env
   nano config.env
   bash pagestream.sh
   ```

---

### Option B: Bifurcated Deployment (Vercel + Render - Recommended)

This mode splits the frontend to Vercel for high performance and the backend to Render.

#### 1. Deploy Frontend on Vercel
1. Link your GitHub repository to Vercel.
2. Select the **`frontend`** directory as the root of the Vercel project.
3. Add the following **Environment Variable** on Vercel Dashboard:
   * **`BACKEND_URL`**: Set this to your production backend URL (e.g. `https://your-app.onrender.com`).
4. Click **Deploy**. Vercel will build the SPA and dynamically proxy API requests via Vercel Edge functions.

#### 2. Deploy Backend on Render.com
1. Click the deploy button:

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/muhammedadnank/Smart-Book-to-Link)

2. Fill in the required environment variables. Ensure you include:
   * **`FRONTEND_URL`**: Set this to your Vercel deployment URL (e.g. `https://your-app.vercel.app`).
   * **`FQDN`**: Your Render backend domain (e.g. `your-app.onrender.com`).
3. Deploy and let it run. The python backend will automatically redirect all stream viewers and admin panel hits to Vercel.

---

## 📄 License

Distributed under the Apache License 2.0. See [LICENSE](LICENSE) for more details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/muhammedadnank">muhammedadnank</a><br>
  <b>⭐ Star this repository if you find it helpful!</b>
</p>
