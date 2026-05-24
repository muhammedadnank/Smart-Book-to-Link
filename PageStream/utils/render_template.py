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
