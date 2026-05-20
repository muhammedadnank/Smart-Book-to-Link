# Thunder/utils/render_template.py

import asyncio
import urllib.parse

from jinja2 import Environment, FileSystemLoader, select_autoescape
from pyrogram.errors import FloodWait

from Thunder.bot import StreamBot
from Thunder.server.exceptions import InvalidHash
from Thunder.utils.file_properties import get_fname, get_uniqid, get_file_category
from Thunder.utils.logger import logger
from Thunder.vars import Var

template_env = Environment(
    loader=FileSystemLoader('Thunder/template'),
    autoescape=select_autoescape(enabled_extensions=("html",), default_for_string=True),
    enable_async=True,
    cache_size=200,
    auto_reload=False,
    optimized=True
)

# MIME types that map to ebook viewer
_EBOOK_MIME_MAP: dict[str, str] = {
    "application/epub+zip":                  "epub",
    "application/epub":                      "epub",
    "application/x-epub":                    "epub",
    "application/pdf":                       "pdf",
    "application/x-pdf":                     "pdf",
    "application/acrobat":                   "pdf",
    "application/vnd.pdf":                   "pdf",
    "text/pdf":                              "pdf",
    "text/x-pdf":                            "pdf",
}

# Extension fallback map
_EBOOK_EXT_MAP: dict[str, str] = {
    ".epub": "epub",
    ".pdf":  "pdf",
}


def _get_ebook_type(file_name: str, mime_type: str | None = None) -> str | None:
    """
    Return 'epub' or 'pdf' if the file should open in the ebook viewer.

    Detection order (most reliable first):
      1. MIME type — works even when Telegram strips the file extension.
      2. File extension — fallback for files where mime_type is absent or generic.
    """
    # 1. MIME type (normalised to lower-case, stripped of parameters like "; charset=utf-8")
    if mime_type:
        base_mime = mime_type.split(";")[0].strip().lower()
        ebook_type = _EBOOK_MIME_MAP.get(base_mime)
        if ebook_type:
            return ebook_type

    # 2. File extension
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
    # NOTE: src must be a pre-encoded URL. Templates use |safe to avoid double-encoding.
    category = get_file_category(file_name)
    ebook_type = _get_ebook_type(file_name, mime_type)
    if ebook_type:
        category = 'ebooks'

    if requested_action != 'stream' or category in ('archives', 'documents'):
        template = template_env.get_template('dl.html')
        context = {
            'file_name': file_name,
            'src': src
        }
        return await template.render_async(**context)

    if category == 'ebooks':
        if not ebook_type:
            lower_name = file_name.lower()
            if lower_name.endswith('.cbz') or lower_name.endswith('.cbr'):
                ebook_type = 'comic'
            else:
                ebook_type = 'offline'

        template = template_env.get_template('ebook.html')
        context = {
            'file_name': file_name,
            'src': f"{src}?disposition=inline",
            'file_type': ebook_type,
        }
        return await template.render_async(**context)

    if category == 'audiobooks':
        template = template_env.get_template('req.html')
        context = {
            'heading': f"Listen to {file_name}",
            'file_name': file_name,
            'src': f"{src}?disposition=inline"
        }
        return await template.render_async(**context)

    template = template_env.get_template('dl.html')
    context = {
        'file_name': file_name,
        'src': src
    }
    return await template.render_async(**context)


async def render_page(message_id: int, secure_hash: str, requested_action: str | None = None) -> str:
    try:
        try:
            message = await StreamBot.get_messages(chat_id=int(Var.BIN_CHANNEL), message_ids=message_id)
        except FloodWait as e:
            await asyncio.sleep(e.value)
            message = await StreamBot.get_messages(chat_id=int(Var.BIN_CHANNEL), message_ids=message_id)

        if not message:
            raise InvalidHash("Message not found")

        file_unique_id = get_uniqid(message)
        file_name = get_fname(message)

        if not file_unique_id or file_unique_id[:6] != secure_hash:
            raise InvalidHash("File unique ID or secure hash mismatch during rendering.")

        # Extract mime_type from the media object so ebook detection works
        # even when Telegram omits the file extension from the file name.
        from Thunder.utils.file_properties import get_media as _get_media
        _media = _get_media(message)
        mime_type: str | None = getattr(_media, 'mime_type', None) if _media else None

        quoted_filename = urllib.parse.quote(file_name.replace('/', '_'), safe="")
        src = urllib.parse.urljoin(Var.URL, f'{secure_hash}{message_id}/{quoted_filename}')
        return await render_media_page(file_name, src, requested_action, mime_type=mime_type)
    except Exception as e:
        logger.error(
            f"Error in render_page for message_id {message_id} and hash {secure_hash}: {e}",
            exc_info=True
        )
        raise
