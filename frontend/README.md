# 🎨 PageStream React SPA Frontend

This is the premium single-page application (SPA) frontend for **PageStream**, built using **React 19** and **Vite 8**. It features a modern glassmorphic interface, smooth micro-animations, customizable dark/sepia themes, and a fully featured administrative dashboard.

---

## 💻 Tech Stack

- **Framework:** React 19 (Functional components with Hooks)
- **Build Tool & Bundler:** Vite 8 (Ultra-fast HMR and bundling)
- **Routing:** React Router 7 (Client-side routing)
- **Icons:** Lucide React
- **Styling:** Custom Vanilla CSS with a global Glassmorphism design system (`index.css`)

---

## 📂 Project Structure

```text
frontend/
├── src/
│   ├── assets/           # Static graphic assets & logo
│   ├── components/       # Shared layout and routing wrappers
│   │   └── AdminLayout.jsx  # Protected wrapper for dashboard components
│   ├── pages/            # Core views and applications
│   │   ├── HomePage.jsx          # Public landing portal
│   │   ├── DownloadPage.jsx      # Unified file download & redirection card
│   │   ├── EbookReaderPage.jsx   # In-browser reader (PDF, EPUB, TXT, CBZ...)
│   │   ├── AudioPlayerPage.jsx   # Vinyl-animated media streamer (MP3, M4B...)
│   │   ├── AdminLoginPage.jsx    # Secure admin entry panel
│   │   ├── AdminDashboardPage.jsx# Live server stats (CPU/RAM/Uptime)
│   │   ├── AdminFilesPage.jsx    # File indices & link deletion control
│   │   ├── AdminUsersPage.jsx    # User management list (Ban/Authorize)
│   │   └── AdminLogsPage.jsx     # Live streamable runtime server logs
│   ├── App.css           # Global layout adjustments
│   ├── App.jsx           # Client router initialization & routes definition
│   ├── index.css         # Glassmorphic color tokens, animations & resets
│   └── main.jsx          # React app DOM mount point
├── index.html            # Core SPA entry HTML page
├── vercel.json           # Production API routing rewrites
├── vite.config.js        # Dev proxy configuration
└── package.json          # Node dependencies & run scripts
```

---

## 🚀 Local Development Setup

To run the React interface locally in development mode:

### 1. Prerequisite
Ensure the Python backend server is running in development mode on port `8080`.

### 2. Install Dependencies
Navigate to the frontend directory and install the required npm packages:
```bash
cd frontend
npm install
```

### 3. Start Dev Server
Fire up the Vite development server:
```bash
npm run dev
```
The application will launch at `http://localhost:5173`. 

### ⚙️ Vite API Proxying
In local development, requests to the backend API (`/api`, `/f`, etc.) must be proxied to avoid CORS issues. This is configured in `vite.config.js`:
- `/api` ➡️ `http://localhost:8080/api`
- `/admin/files/delete` ➡️ `http://localhost:8080/admin/files/delete`
- `/admin/maintenance` ➡️ `http://localhost:8080/admin/maintenance`
- `/f/` ➡️ `http://localhost:8080/f/`

---

## 📦 Production Compiling & Deployment

### Compilation
To bundle the frontend for production, run:
```bash
npm run build
```
This builds static optimized assets in the `frontend/dist/` directory.

### Serving with Python Backend (Monolithic Mode)
On startup, the Python backend checks if `frontend/dist/index.html` exists:
- **Found:** Serves the compiled SPA automatically, bypassing legacy Jinja2 templates.
- **Not Found:** Falls back to legacy Jinja2 server-rendered templates (`ebook.html`, legacy `/admin`).

### Serverless Vercel Deployment (Decoupled Mode)
The frontend can be deployed independently to **Vercel** while communicating with a backend running on Render or elsewhere. 

The API routing is handled dynamically using a Vercel Edge Serverless Function (`api/proxy.js`) combined with `vercel.json` rewrite rules:
- **`vercel.json`** routes all incoming traffic to `/api/*`, `/f/*`, and `/status` to `/api/proxy`.
- **`api/proxy.js`** reads the **`BACKEND_URL`** environment variable from your Vercel Dashboard and proxies the requests to the respective target dynamically.
- All other routes are rewritten to `/index.html` to allow React Router to handle client-side URLs seamlessly.
---

## 🎨 Design System & CSS
All styling uses vanilla CSS under `src/index.css`. The system focuses heavily on:
- **Glassmorphism:** Dark transparent backdrops, subtle blurred filters (`backdrop-filter`), and thin glowing borders.
- **Custom Scrollbars:** Optimized for clean visual hierarchy.
- **Micro-Animations:** Fade-in, scale hover-states, and rotating vinyl disks for audio playback.
