# FileToLink — Project Overview

> **Version:** 2.1.0  
> **Stack:** Python 3.13 · Pyrogram · aiohttp · MongoDB · Jinja2  
> **Purpose:** Telegram Bot — ഉള്ള files-നു streaming & download links generate ചെയ്യുക

---

## Directory Structure

```
FileToLink-main/
├── Thunder/
│   ├── __init__.py              # Version & startup timestamp
│   ├── __main__.py              # Entry point — bot + web server startup
│   ├── vars.py                  # All config vars (env variables)
│   ├── bot/
│   │   ├── __init__.py          # StreamBot & multi_clients dict
│   │   ├── clients.py           # Multi-client initialization
│   │   └── plugins/
│   │       ├── admin.py         # Admin-only bot commands
│   │       ├── callbacks.py     # Inline button callback handlers
│   │       ├── common.py        # User-facing commands (start, help, ping, dc)
│   │       └── stream.py        # Core file → link logic
│   ├── server/
│   │   ├── __init__.py          # aiohttp web app setup
│   │   ├── exceptions.py        # FileNotFound, InvalidHash
│   │   └── stream_routes.py     # HTTP routes for streaming & previews
│   ├── template/
│   │   ├── dl.html              # Download redirect page
│   │   ├── req.html             # Video/audio stream player (Vidstack)
│   │   └── ebook.html           # EPUB / PDF ebook viewer ← (custom addition)
│   └── utils/
│       ├── bot_utils.py         # Helper functions (gen_links, reply, log_user…)
│       ├── broadcast.py         # Admin broadcast system
│       ├── canonical_files.py   # Dedup & canonical file record management (MongoDB)
│       ├── commands.py          # Bot command list setup
│       ├── config_parser.py     # Multi-token env parser (MULTI_TOKEN1…49)
│       ├── custom_dl.py         # ByteStreamer — Telegram file streaming
│       ├── database.py          # MongoDB async database layer
│       ├── decorators.py        # check_banned, require_token, get_shortener_status
│       ├── file_properties.py   # get_media, get_fname, get_fsize, get_hash
│       ├── force_channel.py     # Force-join channel gate
│       ├── human_readable.py    # humanbytes() formatter
│       ├── keepalive.py         # Self-ping to prevent server sleep
│       ├── logger.py            # Logging setup + log file path
│       ├── messages.py          # All bot message strings (centralised)
│       ├── rate_limiter.py      # Per-user & global rate limiting + request queue
│       ├── render_template.py   # Jinja2 page renderer (dl / stream / ebook)
│       ├── shortener.py         # URL shortener plugins (Linkvertise, Bitly, etc.)
│       ├── speedtest.py         # Server speedtest utility
│       ├── time_format.py       # get_readable_time()
│       └── tokens.py            # Token-based access system (generate, check, authorize)
├── config_sample.env            # All environment variables with comments
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Docker image (python:3.13-slim)
├── Procfile                     # Heroku / Railway process definition
├── heroku.yml                   # Heroku Docker deployment config
├── thunder.sh                   # Startup shell script
├── update.py                    # Git-based update utility
├── AGENTS.md                    # AI agent coding guidelines
└── .github/workflows/
    └── dockerize.yml            # GitHub Actions → Docker Hub publish
```

---

## Core Components

### 1. Entry Point — `Thunder/__main__.py`

Bot start-up sequence:

1. `StreamBot` (Pyrogram client) start ചെയ്യും
2. `initialize_clients()` — primary + multi-clients load ചെയ്യും
3. Plugins dynamically import ചെയ്യും (`Thunder/bot/plugins/*.py`)
4. `request_executor` background task start ചെയ്യും
5. `aiohttp` web server start ചെയ്യും (`BIND_ADDRESS:PORT`)
6. Keep-alive + token cleanup background tasks start ചെയ്യും
7. `pyrogram.idle()` — bot running state maintain ചെയ്യും

---

### 2. Configuration — `Thunder/vars.py`

`Var` class — environment variables read ചെയ്ത് typed attributes ആക്കും.

| Variable | Type | Required | Description |
|---|---|---|---|
| `API_ID` | int | ✅ | Telegram API ID |
| `API_HASH` | str | ✅ | Telegram API Hash |
| `BOT_TOKEN` | str | ✅ | Bot token from @BotFather |
| `BIN_CHANNEL` | int | ✅ | Storage channel ID (files copy ചെയ്യുന്നിടം) |
| `OWNER_ID` | int | ✅ | Bot owner Telegram user ID |
| `DATABASE_URL` | str | ✅ | MongoDB connection string |
| `FQDN` | str | ✅ | Bot-ന്റെ domain name |
| `HAS_SSL` | bool | — | HTTPS ഉണ്ടോ (default: True) |
| `PORT` | int | — | Web server port (default: 8080) |
| `NO_PORT` | bool | — | URL-ൽ port hide ചെയ്യണോ (default: True) |
| `FORCE_CHANNEL_ID` | int | — | Join-gate channel ID |
| `TOKEN_ENABLED` | bool | — | Token system on/off |
| `TOKEN_TTL_HOURS` | int | — | Token validity (default: 24h) |
| `SHORTEN_ENABLED` | bool | — | Token links shorten ചെയ്യണോ |
| `SHORTEN_MEDIA_LINKS` | bool | — | Media links shorten ചെയ്യണോ |
| `URL_SHORTENER_API_KEY` | str | — | Shortener API key |
| `URL_SHORTENER_SITE` | str | — | Shortener domain |
| `RATE_LIMIT_ENABLED` | bool | — | Per-user rate limit on/off |
| `MAX_FILES_PER_PERIOD` | int | — | Rate limit window-ൽ max files |
| `RATE_LIMIT_PERIOD_MINUTES` | int | — | Rate limit time window |
| `MAX_QUEUE_SIZE` | int | — | Queue max size (default: 100) |
| `GLOBAL_RATE_LIMIT` | bool | — | Global rate limit on/off |
| `MAX_GLOBAL_REQUESTS_PER_MINUTE` | int | — | Global req/min limit |
| `MULTI_TOKEN1`…`49` | str | — | Additional bot tokens |
| `MAX_BATCH_FILES` | int | — | Batch mode max files (default: 50) |
| `CHANNEL` | bool | — | Channel messages process ചെയ്യണോ |
| `BANNED_CHANNELS` | Set[int] | — | Blocked channel IDs |
| `WORKERS` | int | — | Pyrogram workers (default: 8) |

---

### 3. Bot Plugins

#### `stream.py` — Core Logic
- User ഒരു file send ചെയ്താൽ `BIN_CHANNEL`-ലേക്ക് forward ചെയ്ത് stream/download links generate ചെയ്യും.
- **Batch mode:** Multiple messages reply ചെയ്ത് batch links ഉണ്ടാക്കാം (max: `MAX_BATCH_FILES`).
- Canonical files system ഉപയോഗിച്ച് same file-നു same link return ചെയ്യും (deduplication).
- Rate limiting, token check, ban check, force-channel check ഒക്കെ apply ചെയ്യും.

#### `admin.py` — Owner Commands

| Command | Description |
|---|---|
| `/users` | Total registered users count |
| `/broadcast` | All/authorized/regular users-ലേക്ക് message broadcast |
| `/status` | Bot uptime, active clients, workload |
| `/stats` | CPU, RAM, disk, network usage |
| `/restart` | Bot restart |
| `/log` | Log file download |
| `/authorize <user_id>` | User-ന് permanent access |
| `/deauthorize <user_id>` | Access revoke |
| `/listauth` | Authorized users list |
| `/ban <id> [reason]` | User/channel ban |
| `/unban <id>` | Ban remove |
| `/shell <cmd>` | Shell command execute |
| `/speedtest` | Server internet speed test |

#### `common.py` — User Commands

| Command | Description |
|---|---|
| `/start` | Welcome message + token activation |
| `/help` | Usage guide |
| `/about` | Bot info |
| `/ping` | Bot response time |
| `/dc` | User/file Telegram DC info |

#### `callbacks.py` — Inline Buttons
`help_command`, `about_command`, `close_panel`, `cancel_broadcast`, `restart_broadcast` — callback queries handle ചെയ്യും.

---

### 4. Web Server — `Thunder/server/stream_routes.py`

aiohttp routes — files serve ചെയ്യുന്ന HTTP endpoints.

| Route | Method | Description |
|---|---|---|
| `/` | GET | Status/home page |
| `/status` | GET | Bot status JSON |
| `/{hash}{id}/{name}` | GET/HEAD | Secure hash + message ID ഉള്ള file stream |
| `/f/{public_hash}/{name}` | GET/HEAD | Canonical (dedup) file stream |
| `/watch/{path}` | GET | Video/audio/ebook preview page |
| `/watch/f/{hash}/{name}` | GET | Canonical file preview page |

**File serving features:**
- HTTP Range requests support (seek/resume)
- `disposition=inline` or `attachment` query param
- CORS headers — cross-origin streaming support
- Load balancing across multi-clients

---

### 5. Templates — `Thunder/template/`

#### `dl.html`
File download ചെയ്യുന്ന page. Meta refresh ഉപയോഗിച്ച് direct file URL-ലേക്ക് redirect ചെയ്യും.

#### `req.html`
Video/audio files-നുള്ള cinema-style player.
- **Player:** Vidstack (CDN)
- Dark atmospheric UI with gradient mesh background
- File metadata display (duration, resolution)

#### `ebook.html` ← Custom Addition
EPUB/PDF files-നുള്ള ebook viewer.
- **EPUB:** EPUB.js library — paginated reading, TOC sidebar, font size control, Light/Sepia/Dark themes
- **PDF:** PDF.js (v4.4) — all pages render ചെയ്യും, progress indicator
- Keyboard navigation: `←` `→` page turn, `T` TOC toggle
- Download button always available

---

### 6. Utils

#### `render_template.py`
Jinja2 templates render ചെയ്യും. File type detect ചെയ്ത് correct template select ചെയ്യും.

**Ebook detection (priority order):**
1. MIME type — `application/epub+zip`, `application/pdf`, etc. (9 variants)
2. File extension — `.epub`, `.pdf`

#### `canonical_files.py`
Same file multiple times upload ചെയ്ത് different links avoid ചെയ്യുന്ന deduplication system.
- SHA-256 based `public_hash` (20 chars)
- MongoDB-ൽ file records cache ചെയ്യും
- In-memory LRU cache (4096 items, 10 min TTL)
- Background touch tasks — `last_seen_at` update ചെയ്യും

#### `custom_dl.py` — `ByteStreamer`
Telegram-ൽ നിന്ന് file bytes stream ചെയ്യും.
- HTTP Range support- നു chunk-based streaming
- Multi-client fallback — primary client fail ആയാൽ secondary try ചെയ്യും
- FloodWait automatic retry

#### `database.py`
MongoDB async layer (pymongo AsyncMongoClient).

**Collections:**

| Collection | Purpose |
|---|---|
| `users` | Registered users |
| `banned_users` | Banned users |
| `banned_channels` | Banned channels |
| `tokens` | Access tokens (TTL indexed) |
| `authorized_users` | Permanently authorized users |
| `restart_message` | Restart state persistence |
| `files` | Canonical file records |
| `file_ingest_locks` | Concurrent upload dedup locks |

#### `rate_limiter.py`
Two-level rate limiting:
- **Per-user:** `MAX_FILES_PER_PERIOD` files per `RATE_LIMIT_PERIOD_MINUTES`
- **Global:** `MAX_GLOBAL_REQUESTS_PER_MINUTE` across all users
- Priority queue — authorized users prioritized
- Request queue with `MAX_QUEUE_SIZE` limit

#### `tokens.py`
Token-based access control.
- `generate(user_id)` — URL-safe random token create ചെയ്യും
- `check(user_id)` — valid activated token ഉണ്ടോ verify ചെയ്യും
- `authorize(user_id)` — permanent access grant ചെയ്യും
- TTL: MongoDB TTL index ഉപയോഗിച്ച് auto-expire

#### `shortener.py`
URL shortener plugin system.
- **Linkvertise** — link-to.net, up-to-down.net, direct-link.net, file-link.net
- **Bitly** — api.bit.ly
- **Other** — generic `shorten.me`-style API support

#### `decorators.py`
Request pipeline decorators:
- `check_banned` — banned user/channel check
- `require_token` — token validation + generation
- `get_shortener_status` — shortener enabled/disabled check

#### `force_channel.py`
Users-നെ ഒരു channel join ചെയ്യാൻ force ചെയ്യും. `FORCE_CHANNEL_ID` set ആണെങ്കിൽ member check ചെയ്യും.

#### `broadcast.py`
Admin broadcast system — all/authorized/regular users-ലേക്ക് batch message send ചെയ്യും. Cancel support ഉണ്ട്.

---

### 7. Multi-Client System

`MULTI_TOKEN1` മുതൽ `MULTI_TOKEN49` വരെ additional bot tokens configure ചെയ്യാം.

- Load balancing — least loaded client-ലേക്ക് requests route ചെയ്യും
- Max 8 concurrent transfers per client
- `work_loads` dict — active request count track ചെയ്യും

---

### 8. Deployment

#### Docker
```bash
docker build -t filetolink .
docker run -d --env-file config.env filetolink
```

#### Heroku / Railway
`Procfile` + `heroku.yml` included.

#### Manual
```bash
cp config_sample.env config.env
# config.env edit ചെയ്ത് required values set ചെയ്യുക
pip install -r requirements.txt
python -m Thunder
```

---

### 9. Request Flow

```
User sends file to bot
        ↓
check_banned → require_token → force_channel_check → rate_limiter
        ↓
canonical_files: same file before? → return existing link
        ↓ (new file)
copy to BIN_CHANNEL
        ↓
generate secure_hash + stream/download URLs
        ↓
save canonical record to MongoDB
        ↓
send links to user (with optional URL shortening)

User opens stream link (/watch/...)
        ↓
render_template: file type detect
  ├── video/audio  → req.html  (Vidstack player)
  ├── epub/pdf     → ebook.html (EPUB.js / PDF.js)
  └── other        → dl.html   (download redirect)
        ↓
ByteStreamer: Telegram → HTTP Range stream → browser
```

---

### 10. Custom Additions (ebook viewer)

**Modified files:**
- `Thunder/utils/render_template.py` — MIME type + extension based ebook detection
- `Thunder/server/stream_routes.py` — `mime_type` pass to renderer (canonical route)

**New file:**
- `Thunder/template/ebook.html` — full EPUB/PDF viewer

**Supported MIME types for ebook viewer:**
`application/epub+zip`, `application/epub`, `application/x-epub`, `application/pdf`, `application/x-pdf`, `application/acrobat`, `application/vnd.pdf`, `text/pdf`, `text/x-pdf`

**Supported extensions:** `.epub`, `.pdf`
