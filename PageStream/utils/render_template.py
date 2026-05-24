# PageStream/utils/render_template.py

import asyncio
import urllib.parse

from jinja2 import Environment, FileSystemLoader, select_autoescape
from pyrogram.errors import FloodWait

from PageStream.bot import StreamBot
from PageStream.server.exceptions import InvalidHash
from PageStream.utils.file_properties import get_fname, get_media, get_uniqid, get_file_category
from PageStream.utils.logger import logger
from PageStream.vars import Var

template_env = Environment(
    loader=FileSystemLoader('PageStream/template'),
    autoescape=select_autoescape(enabled_extensions=("html",), default_for_string=True),
    enable_async=True,
    cache_size=200,
    auto_reload=False,
    optimized=True
)

# MIME types that map to the ebook viewer
_EBOOK_MIME_MAP: dict[str, str] = {
    "application/epub+zip":               "epub",
    "application/epub":                   "epub",
    "application/x-epub":                 "epub",
    "application/pdf":                    "pdf",
    "application/x-pdf":                  "pdf",
    "application/acrobat":                "pdf",
    "application/vnd.pdf":                "pdf",
    "text/pdf":                           "pdf",
    "text/x-pdf":                         "pdf",
    "text/plain":                         "txt",
    "text/x-plain":                       "txt",
    "application/x-fb2":                  "fb2",
    "application/fb2":                    "fb2",
    "text/fb2":                           "fb2",
    "image/vnd.djvu":                     "djvu",
    "image/x-djvu":                       "djvu",
    "image/djvu":                         "djvu",
    "application/x-djvu":                 "djvu",
    "application/vnd.djvu":               "djvu",
    "application/x-mobipocket-ebook":     "mobi",
    "application/vnd.amazon.ebook":       "mobi",
}

# Extension fallback map
_EBOOK_EXT_MAP: dict[str, str] = {
    ".epub": "epub",
    ".pdf":  "pdf",
    ".txt":  "txt",
    ".fb2":  "fb2",
    ".djvu": "djvu",
    ".djv":  "djvu",
    ".mobi": "mobi",
    ".azw":  "mobi",
    ".azw3": "mobi",
    ".lit":  "offline",
}


def _get_ebook_type(file_name: str, mime_type: str | None = None) -> str | None:
    """
    Return 'epub' or 'pdf' if the file should open in the ebook viewer.

    Detection order (most reliable first):
      1. MIME type — works even when Telegram strips the file extension.
      2. File extension — fallback when mime_type is absent or generic.
    """
    if mime_type:
        base_mime = mime_type.split(";")[0].strip().lower()
        ebook_type = _EBOOK_MIME_MAP.get(base_mime)
        if ebook_type:
            return ebook_type

    lower = (file_name or "").lower()
    for ext, ebook_type in _EBOOK_EXT_MAP.items():
        if lower.endswith(ext):
            return ebook_type

    return None


def render_fallback_page(file_name: str, src: str, category: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Download {file_name}</title>
        <style>
            body {{
                background: linear-gradient(135deg, #0f172a, #1e1b4b);
                color: #f8fafc;
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                padding: 1rem;
                box-sizing: border-box;
            }}
            .card {{
                background: rgba(255, 255, 255, 0.03);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 24px;
                padding: 3rem 2rem;
                max-width: 500px;
                width: 100%;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }}
            .icon {{
                font-size: 3.5rem;
                margin-bottom: 1.5rem;
                display: inline-block;
            }}
            h1 {{
                font-size: 1.6rem;
                margin: 0 0 1rem;
                font-weight: 700;
                line-height: 1.4;
                word-break: break-all;
                background: linear-gradient(to right, #38bdf8, #818cf8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }}
            .meta {{
                font-size: 0.9rem;
                color: #94a3b8;
                margin-bottom: 2.5rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }}
            .btn {{
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #6366f1, #4f46e5);
                color: white;
                text-decoration: none;
                padding: 1rem 2rem;
                border-radius: 12px;
                font-weight: 600;
                transition: all 0.2s;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                width: 100%;
                box-sizing: border-box;
            }}
            .btn:hover {{
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
            }}
            .btn:active {{
                transform: translateY(0);
            }}
            .hint {{
                margin-top: 2rem;
                font-size: 0.8rem;
                color: #64748b;
                line-height: 1.5;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <span class="icon">📦</span>
            <h1>{file_name}</h1>
            <div class="meta">{category}</div>
            <a href="{src}" class="btn" download>Download File</a>
            <div class="hint">
                Note: For streaming books or audio, please configure your frontend Vercel URL in the environment settings (FRONTEND_URL).
            </div>
        </div>
    </body>
    </html>
    """


async def render_media_page(
    file_name: str,
    src: str,
    requested_action: str | None = None,
    mime_type: str | None = None,
) -> str:
    # Check if SPA is available (locally or hosted externally via FRONTEND_URL) and should be served
    import os
    frontend_url = os.getenv("FRONTEND_URL", "").rstrip("/")
    if frontend_url or os.path.exists("frontend/dist/index.html"):
        from aiohttp import web
        category = get_file_category(file_name)
        ebook_type = _get_ebook_type(file_name, mime_type)
        if ebook_type:
            category = 'ebooks'
            
        encoded_fn = urllib.parse.quote(file_name)
        encoded_src = urllib.parse.quote(src)
        
        if category == 'ebooks':
            path = f"/watch/ebook?file_name={encoded_fn}&src={encoded_src}"
        elif category == 'audiobooks':
            path = f"/watch/audio?file_name={encoded_fn}&src={encoded_src}"
        else:
            path = f"/watch/download?file_name={encoded_fn}&src={encoded_src}"
            
        redirect_url = f"{frontend_url}{path}" if frontend_url else path
        raise web.HTTPFound(redirect_url)

    # NOTE: src must be a pre-encoded URL. Templates use |safe to avoid double-encoding.
    category = get_file_category(file_name)
    ebook_type = _get_ebook_type(file_name, mime_type)
    if ebook_type:
        category = 'ebooks'

    try:
        if requested_action != 'stream' or category in ('archives', 'documents'):
            template = template_env.get_template('viewers/dl.html')
            return await template.render_async(file_name=file_name, src=src)

        if category == 'ebooks':
            if not ebook_type:
                lower_name = file_name.lower()
                if lower_name.endswith('.cbz'):
                    ebook_type = 'comic'
                elif lower_name.endswith('.cbr'):
                    ebook_type = 'cbr'
                else:
                    ebook_type = 'offline'

            template = template_env.get_template('viewers/ebook.html')
            return await template.render_async(
                file_name=file_name,
                src=f"{src}?disposition=inline",
                file_type=ebook_type,
            )

        if category == 'audiobooks':
            template = template_env.get_template('viewers/req.html')
            return await template.render_async(
                heading=f"Listen to {file_name}",
                file_name=file_name,
                src=f"{src}?disposition=inline",
            )

        template = template_env.get_template('viewers/dl.html')
        return await template.render_async(file_name=file_name, src=src)
    except Exception as e:
        logger.warning(f"Templates not found or failed to load. Falling back to inline HTML. Error: {e}")
        return render_fallback_page(file_name, src, category)


async def render_page(
    message_id: int,
    secure_hash: str,
    requested_action: str | None = None
) -> str:
    try:
        try:
            message = await StreamBot.get_messages(
                chat_id=int(Var.BIN_CHANNEL),
                message_ids=message_id
            )
        except FloodWait as e:
            await asyncio.sleep(e.value)
            message = await StreamBot.get_messages(
                chat_id=int(Var.BIN_CHANNEL),
                message_ids=message_id
            )

        if not message:
            raise InvalidHash("Message not found")

        file_unique_id = get_uniqid(message)
        file_name      = get_fname(message)

        if not file_unique_id or file_unique_id[:6] != secure_hash:
            raise InvalidHash("File unique ID or secure hash mismatch during rendering.")

        # get_media is now imported at the top of this module — no inline import needed.
        _media    = get_media(message)
        mime_type = getattr(_media, 'mime_type', None) if _media else None

        quoted_filename = urllib.parse.quote(file_name.replace('/', '_'), safe="")
        src = urllib.parse.urljoin(Var.URL, f'{secure_hash}{message_id}/{quoted_filename}')
        return await render_media_page(file_name, src, requested_action, mime_type=mime_type)

    except Exception as e:
        from aiohttp import web
        if isinstance(e, web.HTTPException):
            raise
        logger.error(
            f"Error in render_page for message_id {message_id} and hash {secure_hash}: {e}",
            exc_info=True
        )
        raise
