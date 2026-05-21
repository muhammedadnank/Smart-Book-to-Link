# PageStream/server/stream_routes.py

import re
import secrets
import time
import datetime
import psutil
from urllib.parse import quote, unquote

from aiohttp import web

from PageStream import __version__, StartTime
from PageStream.bot import StreamBot, multi_clients, work_loads
from PageStream.server.exceptions import FileNotFound, InvalidHash
from PageStream.utils.bot_utils import quote_media_name
from PageStream.utils.canonical_files import (
    PUBLIC_HASH_LENGTH,
    get_file_by_hash,
    update_cached_file_id,
    build_file_record,
    build_public_hash,
)
from PageStream.utils.custom_dl import ByteStreamer
from PageStream.utils.file_properties import get_media
from PageStream.utils.logger import logger
from PageStream.utils.render_template import render_media_page, render_page, template_env
from PageStream.utils.time_format import get_readable_time
from PageStream.utils.database import db
from PageStream.vars import Var

routes = web.RouteTableDef()

SECURE_HASH_LENGTH = 6
CHUNK_SIZE = 1024 * 1024
MAX_CONCURRENT_PER_CLIENT = 8
RANGE_REGEX = re.compile(r"^bytes=(?P<start>\d*)-(?P<end>\d*)$")
PATTERN_HASH_FIRST = re.compile(
    rf"^([a-zA-Z0-9_-]{{{SECURE_HASH_LENGTH}}})(\d+)(?:/.*)?$")
PATTERN_ID_FIRST = re.compile(r"^(\d+)(?:/.*)?$")
VALID_HASH_REGEX = re.compile(r'^[a-zA-Z0-9_-]+$')
VALID_PUBLIC_HASH_REGEX = re.compile(rf'^[0-9a-f]{{{PUBLIC_HASH_LENGTH}}}$')
VALID_DISPOSITIONS = {"inline", "attachment"}

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range, Content-Type, *",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, Content-Disposition",
}

streamers = {}


def get_streamer(client_id: int) -> ByteStreamer:
    if client_id not in streamers:
        streamers[client_id] = ByteStreamer(multi_clients[client_id])
    return streamers[client_id]


def parse_media_request(path: str, query: dict) -> tuple[int, str]:
    clean_path = unquote(path).strip('/')

    match = PATTERN_HASH_FIRST.match(clean_path)
    if match:
        try:
            message_id = int(match.group(2))
            secure_hash = match.group(1)
            if (len(secure_hash) == SECURE_HASH_LENGTH and
                    VALID_HASH_REGEX.match(secure_hash)):
                return message_id, secure_hash
        except ValueError as e:
            raise InvalidHash(f"Invalid message ID format in path: {e}") from e

    match = PATTERN_ID_FIRST.match(clean_path)
    if match:
        try:
            message_id = int(match.group(1))
            secure_hash = query.get("hash", "").strip()
            if (len(secure_hash) == SECURE_HASH_LENGTH and
                    VALID_HASH_REGEX.match(secure_hash)):
                return message_id, secure_hash
            else:
                raise InvalidHash("Invalid or missing hash in query parameter")
        except ValueError as e:
            raise InvalidHash(f"Invalid message ID format in path: {e}") from e

    raise InvalidHash("Invalid URL structure or missing hash")


def validate_public_hash(public_hash: str) -> str:
    secure_hash = public_hash.strip().lower()
    if len(secure_hash) != PUBLIC_HASH_LENGTH or not VALID_PUBLIC_HASH_REGEX.match(secure_hash):
        raise InvalidHash("Invalid canonical file hash")
    return secure_hash


def select_optimal_client() -> tuple[int, ByteStreamer]:
    if not work_loads:
        raise web.HTTPInternalServerError(
            text=("No available clients to handle the request. "
                  "Please try again later."))

    available_clients = [
        (cid, load) for cid, load in work_loads.items()
        if load < MAX_CONCURRENT_PER_CLIENT]

    if available_clients:
        client_id = min(available_clients, key=lambda x: x[1])[0]
    else:
        client_id = min(work_loads, key=work_loads.get)

    return client_id, get_streamer(client_id)


def get_content_disposition(request: web.Request) -> str:
    disposition = request.query.get("disposition", "attachment").strip().lower()
    return disposition if disposition in VALID_DISPOSITIONS else "attachment"


def parse_range_header(range_header: str, file_size: int) -> tuple[int, int]:
    if not range_header:
        return 0, file_size - 1

    match = RANGE_REGEX.fullmatch(range_header)
    if not match:
        raise web.HTTPBadRequest(text=f"Invalid range header: {range_header}")

    start_str = match.group("start")
    end_str = match.group("end")
    if start_str:
        start = int(start_str)
        end = int(end_str) if end_str else file_size - 1
    else:
        if not end_str:
            raise web.HTTPBadRequest(text=f"Invalid range header: {range_header}")
        suffix_len = int(end_str)
        if suffix_len <= 0:
            raise web.HTTPRequestRangeNotSatisfiable(
                headers={"Content-Range": f"bytes */{file_size}"})
        start = max(file_size - suffix_len, 0)
        end = file_size - 1

    if start < 0 or end >= file_size or start > end:
        raise web.HTTPRequestRangeNotSatisfiable(
            headers={"Content-Range": f"bytes */{file_size}"}
        )

    return start, end


def _resolve_unique_id(file_info: dict) -> str:
    unique_id = file_info.get("unique_id") or file_info.get("file_unique_id")
    if not unique_id:
        raise FileNotFound("File unique ID not found in info.")
    return unique_id


def _resolve_filename(file_info: dict, mime_type: str) -> str:
    filename = file_info.get("file_name")
    if filename:
        return filename

    ext = mime_type.split('/')[-1] if '/' in mime_type else 'bin'
    ext_map = {'jpeg': 'jpg', 'mpeg': 'mp3', 'octet-stream': 'bin'}
    ext = ext_map.get(ext, ext)
    return f"file_{secrets.token_hex(4)}.{ext}"


async def _serve_media_response(
    request: web.Request,
    *,
    file_info: dict,
    streamer: ByteStreamer,
    client_id: int,
    media_ref: int | str,
    fallback_message_id: int | None = None,
    on_fallback_message=None
):
    file_size = int(file_info.get('file_size', 0) or 0)
    if file_size == 0:
        raise FileNotFound("File size is reported as zero or unavailable.")

    range_header = request.headers.get("Range", "")
    start, end = parse_range_header(range_header, file_size)
    content_length = end - start + 1

    if start == 0 and end == file_size - 1:
        range_header = ""

    mime_type = file_info.get('mime_type') or 'application/octet-stream'
    filename = _resolve_filename(file_info, mime_type)
    disposition = get_content_disposition(request)

    headers = {
        "Content-Type": mime_type,
        "Content-Length": str(content_length),
        "Content-Disposition": (
            f"{disposition}; filename*=UTF-8''{quote(filename, safe='')}"),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Range, Content-Type, *",
        "Access-Control-Expose-Headers": (
            "Content-Length, Content-Range, Content-Disposition"),
        "X-Content-Type-Options": "nosniff"
    }

    if range_header:
        headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"

    if request.method == 'HEAD':
        work_loads[client_id] -= 1
        return web.Response(
            status=206 if range_header else 200,
            headers=headers
        )

    async def stream_generator():
        try:
            bytes_sent = 0
            bytes_to_skip = start % CHUNK_SIZE

            async for chunk in streamer.stream_file(
                media_ref,
                offset=start,
                limit=content_length,
                fallback_message_id=fallback_message_id,
                on_fallback_message=on_fallback_message
            ):
                if bytes_to_skip > 0:
                    if len(chunk) <= bytes_to_skip:
                        bytes_to_skip -= len(chunk)
                        continue
                    chunk = chunk[bytes_to_skip:]
                    bytes_to_skip = 0

                remaining = content_length - bytes_sent
                if len(chunk) > remaining:
                    chunk = chunk[:remaining]

                if chunk:
                    yield chunk
                    bytes_sent += len(chunk)

                if bytes_sent >= content_length:
                    break
        finally:
            work_loads[client_id] -= 1

    return web.Response(
        status=206 if range_header else 200,
        body=stream_generator(),
        headers=headers
    )


@routes.get("/", allow_head=True)
async def root_redirect(request):
    from PageStream.utils.render_template import template_env
    template = template_env.get_template('pages/home.html')
    bot_uname = getattr(StreamBot, "username", "FileToLinkBot") or "FileToLinkBot"
    rendered_home = await template.render_async(bot_username=bot_uname)
    return web.Response(
        text=rendered_home,
        content_type='text/html',
        headers={
            "Access-Control-Allow-Origin": "*",
            "X-Content-Type-Options": "nosniff"
        }
    )


@routes.get("/status", allow_head=True)
async def status_endpoint(request):
    uptime = time.time() - StartTime
    total_load = sum(work_loads.values())

    workload_distribution = {str(k): v for k, v in sorted(work_loads.items())}

    return web.json_response(
        {
            "server": {
                "status": "operational",
                "version": __version__,
                "uptime": get_readable_time(uptime)
            },
            "telegram_bot": {
                "username": f"@{StreamBot.username}",
                "active_clients": len(multi_clients)
            },
            "resources": {
                "total_workload": total_load,
                "workload_distribution": workload_distribution
            }
        },
        headers={"Access-Control-Allow-Origin": "*"}
    )


@routes.options("/status")
async def status_options(request: web.Request):
    return web.Response(headers={
        **CORS_HEADERS,
        "Access-Control-Max-Age": "86400"
    })


@routes.options(r"/{path:.+}")
async def media_options(request: web.Request):
    return web.Response(headers={
        **CORS_HEADERS,
        "Access-Control-Max-Age": "86400"
    })


@routes.get(r"/watch/f/{secure_hash}/{name:.+}", allow_head=True)
async def canonical_media_preview(request: web.Request):
    try:
        secure_hash = validate_public_hash(request.match_info["secure_hash"])
        file_record = await get_file_by_hash(secure_hash, raise_on_error=False)
        if not file_record:
            raise FileNotFound("Canonical file not found")

        file_name = file_record.get("file_name") or f"file_{secure_hash}"
        mime_type = file_record.get("mime_type")
        src = f"{Var.URL.rstrip('/')}/f/{secure_hash}/{quote_media_name(file_name)}"
        rendered_page = await render_media_page(file_name, src, requested_action='stream', mime_type=mime_type)

        response = web.Response(
            text=rendered_page,
            content_type='text/html',
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Range, Content-Type, *",
                "X-Content-Type-Options": "nosniff",
            }
        )
        response.enable_compression()
        return response
    except (InvalidHash, FileNotFound) as e:
        logger.debug(f"Canonical preview error: {type(e).__name__} - {e}", exc_info=True)
        raise web.HTTPNotFound(text="Resource not found") from e
    except Exception as e:
        error_id = secrets.token_hex(6)
        logger.error(f"Canonical preview error {error_id}: {e}", exc_info=True)
        raise web.HTTPInternalServerError(
            text=f"Server error occurred: {error_id}") from e


@routes.get(r"/watch/{path:.+}", allow_head=True)
async def media_preview(request: web.Request):
    try:
        path = request.match_info["path"]
        message_id, secure_hash = parse_media_request(path, request.query)

        rendered_page = await render_page(
            message_id, secure_hash, requested_action='stream')

        response = web.Response(
            text=rendered_page,
            content_type='text/html',
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Range, Content-Type, *",
                "X-Content-Type-Options": "nosniff",
            }
        )
        response.enable_compression()
        return response

    except (InvalidHash, FileNotFound) as e:
        logger.debug(
            f"Client error in preview: {type(e).__name__} - {e}",
            exc_info=True)
        raise web.HTTPNotFound(text="Resource not found") from e
    except Exception as e:
        error_id = secrets.token_hex(6)
        logger.error(f"Preview error {error_id}: {e}", exc_info=True)
        raise web.HTTPInternalServerError(
            text=f"Server error occurred: {error_id}") from e


@routes.get(r"/f/{secure_hash}/{name:.+}", allow_head=True)
async def canonical_media_delivery(request: web.Request):
    try:
        secure_hash = validate_public_hash(request.match_info["secure_hash"])
        file_record = await get_file_by_hash(secure_hash, raise_on_error=False)
        if not file_record:
            raise FileNotFound("Canonical file not found")

        client_id, streamer = select_optimal_client()
        work_loads[client_id] += 1

        try:
            _resolve_unique_id(file_record)
            media_ref = int(file_record["canonical_message_id"])
            fallback_message_id = int(file_record["canonical_message_id"])

            async def persist_refreshed_file_id(message):
                if client_id != 0:
                    return
                media = get_media(message)
                new_file_id = getattr(media, "file_id", None) if media else None
                if new_file_id and new_file_id != file_record.get("file_id"):
                    try:
                        await update_cached_file_id(file_record, new_file_id)
                    except Exception as e:
                        logger.warning(
                            f"Failed to refresh cached file_id for canonical file {secure_hash}: {e}",
                            exc_info=True
                        )

            return await _serve_media_response(
                request,
                file_info=file_record,
                streamer=streamer,
                client_id=client_id,
                media_ref=media_ref,
                fallback_message_id=fallback_message_id,
                on_fallback_message=persist_refreshed_file_id
            )
        except (FileNotFound, InvalidHash):
            work_loads[client_id] -= 1
            raise
        except Exception as e:
            work_loads[client_id] -= 1
            error_id = secrets.token_hex(6)
            logger.error(f"Canonical stream error {error_id}: {e}", exc_info=True)
            raise web.HTTPInternalServerError(
                text=f"Server error during streaming: {error_id}") from e
    except (InvalidHash, FileNotFound) as e:
        logger.debug(f"Canonical client error: {type(e).__name__} - {e}", exc_info=True)
        raise web.HTTPNotFound(text="Resource not found") from e
    except Exception as e:
        error_id = secrets.token_hex(6)
        logger.error(f"Canonical server error {error_id}: {e}", exc_info=True)
        raise web.HTTPInternalServerError(
            text=f"An unexpected server error occurred: {error_id}") from e


def is_admin_session(request: web.Request) -> bool:
    return request.cookies.get("admin_session") == Var.ADMIN_PASSWORD

@routes.get("/admin", allow_head=True)
async def admin_dashboard(request: web.Request):
    if not is_admin_session(request):
        return web.HTTPFound("/admin/login")
    
    total_users = await db.total_users_count()
    authorized_users = await db.get_authorized_users_count()
    total_files = await db.files_col.count_documents({})
    uptime = get_readable_time(time.time() - StartTime)
    active_clients = sum(1 for load in work_loads.values() if load > 0)
    cpu_usage = psutil.cpu_percent(interval=None)
    ram_usage = psutil.virtual_memory().percent
    
    template = template_env.get_template('admin/dashboard.html')
    html = await template.render_async(
        total_users=total_users,
        authorized_users=authorized_users,
        total_files=total_files,
        uptime=uptime,
        active_clients=active_clients,
        cpu=cpu_usage,
        ram=ram_usage
    )
    return web.Response(text=html, content_type="text/html")

@routes.get("/admin/login", allow_head=True)
async def admin_login_get(request: web.Request):
    if is_admin_session(request):
        return web.HTTPFound("/admin")
    template = template_env.get_template('admin/login.html')
    html = await template.render_async(error=None)
    return web.Response(text=html, content_type="text/html")

@routes.post("/admin/login")
async def admin_login_post(request: web.Request):
    data = await request.post()
    password = data.get("password")
    
    if password == Var.ADMIN_PASSWORD:
        response = web.HTTPFound("/admin")
        response.set_cookie("admin_session", password, max_age=86400 * 30) # 30 days
        return response
        
    template = template_env.get_template('admin/login.html')
    html = await template.render_async(error="Invalid password")
    return web.Response(text=html, content_type="text/html", status=401)

@routes.get("/admin/logout", allow_head=True)
async def admin_logout(request: web.Request):
    response = web.HTTPFound("/admin/login")
    response.del_cookie("admin_session")
    return response

@routes.get("/admin/users", allow_head=True)
async def admin_users(request: web.Request):
    if not is_admin_session(request):
        return web.HTTPFound("/admin/login")
    
    cursor = await db.get_all_users()
    users = await cursor.to_list(length=None)
    
    for u in users:
        u['is_authorized'] = await db.is_user_authorized(u['id'])
        u['is_banned'] = await db.is_user_banned(u['id'])
        u['is_owner'] = (u['id'] == Var.OWNER_ID)
        
    template = template_env.get_template('admin/users.html')
    html = await template.render_async(users=users)
    return web.Response(text=html, content_type="text/html")

@routes.get("/admin/files", allow_head=True)
async def admin_files(request: web.Request):
    if not is_admin_session(request):
        return web.HTTPFound("/admin/login")
    
    query = request.query.get("q", "").strip()
    search_filter = {}
    if query:
        search_filter = {
            "$or": [
                {"file_name": {"$regex": query, "$options": "i"}},
                {"public_hash": {"$regex": query, "$options": "i"}}
            ]
        }
        
    cursor = db.files_col.find(search_filter).sort("created_at", -1).limit(200)
    files = await cursor.to_list(length=None)
    
    template = template_env.get_template('admin/files.html')
    html = await template.render_async(files=files, query=query)
    return web.Response(text=html, content_type="text/html")

@routes.post("/admin/files/delete/{hash}")
async def admin_files_delete(request: web.Request):
    if not is_admin_session(request):
        return web.json_response({"error": "Unauthorized"}, status=401)
    
    file_hash = request.match_info["hash"]
    result = await db.files_col.delete_one({"public_hash": file_hash})
    if result.deleted_count > 0:
        return web.json_response({"success": True})
    return web.json_response({"error": "File not found"}, status=404)

@routes.post("/admin/maintenance/clear_unused_files")
async def admin_clear_unused_files(request: web.Request):
    if not is_admin_session(request):
        return web.json_response({"error": "Unauthorized"}, status=401)
    
    # 5 days ago
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=5)
    result = await db.files_col.delete_many({"last_seen_at": {"$lt": cutoff}})
    return web.json_response({"success": True, "deleted_count": result.deleted_count})

@routes.post("/admin/maintenance/clear_tokens")
async def admin_clear_tokens(request: web.Request):
    if not is_admin_session(request):
        return web.json_response({"error": "Unauthorized"}, status=401)
    
    now = datetime.datetime.now(datetime.timezone.utc)
    result = await db.token_col.delete_many({"expires_at": {"$lt": now}})
    return web.json_response({"success": True, "deleted_count": result.deleted_count})


@routes.get("/admin/logs", allow_head=True)
async def admin_logs(request: web.Request):
    if not is_admin_session(request):
        return web.HTTPFound("/admin/login")
    
    logs = ""
    try:
        import os
        from PageStream.utils.logger import LOG_FILE
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                lines = f.readlines()
                logs = "".join(lines[-100:])
        else:
            logs = f"Log file not found at {LOG_FILE}"
    except Exception as e:
        logs = f"Error reading logs: {e}"
        
    template = template_env.get_template('admin/logs.html')
    html = await template.render_async(logs=logs, log_path=os.path.basename(LOG_FILE) if 'LOG_FILE' in locals() else "Unknown")
    return web.Response(text=html, content_type="text/html")


def _rebuild_pyrogram_file_id(stored_file_id: str, file_ref_b64: str) -> str | None:
    """
    Reconstruct a Pyrogram-compatible file_id from Ebook-Search-Bot's custom
    stripped format (encode_file_id output) + base64url file_ref.
    """
    try:
        import base64
        from struct import unpack as su
        from pyrogram.file_id import FileId, FileType

        # 1. Undo custom base64url + zero run-length encoding
        b64 = stored_file_id + "=" * (-len(stored_file_id) % 4)
        compressed = base64.urlsafe_b64decode(b64)
        raw = b""
        i = 0
        while i < len(compressed):
            if compressed[i] == 0 and i + 1 < len(compressed):
                raw += b"\x00" * compressed[i + 1]
                i += 2
            else:
                raw += bytes([compressed[i]])
                i += 1

        # 2. Unpack: <iiqq = file_type(4) + dc_id(4) + media_id(8) + access_hash(8) = 24 bytes
        if len(raw) < 24:
            return None
        file_type_int, dc_id, media_id, access_hash = su("<iiqq", raw[:24])

        # 3. Decode file_reference
        file_reference = b""
        if file_ref_b64:
            padding = -len(file_ref_b64) % 4
            file_reference = base64.urlsafe_b64decode(file_ref_b64 + "=" * padding)

        # 4. Build Pyrogram FileId and encode
        fid = FileId(
            major=4,
            minor=22,
            file_type=FileType(file_type_int),
            dc_id=dc_id,
            media_id=media_id,
            access_hash=access_hash,
            file_reference=file_reference
        )
        return fid.encode()
    except Exception as e:
        logger.warning(f"_rebuild_pyrogram_file_id failed: {e}")
        return None


@routes.get(r"/watch/by-file-id/{file_id}/{name:.+}", allow_head=True)
async def watch_by_file_id(request: web.Request):
    """
    On-demand registration for files from external bots (e.g. Ebook-Search-Bot).
    Reconstructs a proper Pyrogram file_id, copies to BIN_CHANNEL, registers in
    PageStream DB, then redirects to /watch/f/{hash}/{name} for streaming.
    """
    try:
        raw_file_id = request.match_info["file_id"]
        name = unquote(request.match_info.get("name", "file"))
        file_ref_b64 = request.query.get("ref", "")

        if not raw_file_id or len(raw_file_id) < 10:
            raise web.HTTPBadRequest(text="Invalid file_id")

        # Reconstruct a Pyrogram-compatible file_id
        full_file_id = _rebuild_pyrogram_file_id(raw_file_id, file_ref_b64)
        if not full_file_id:
            logger.warning(f"Could not reconstruct file_id from: {raw_file_id[:20]}…")
            raise web.HTTPNotFound(text="Resource not found")

        # Copy to BIN_CHANNEL to get canonical message + file_unique_id
        try:
            stored_msg = await StreamBot.send_cached_media(
                chat_id=int(Var.BIN_CHANNEL),
                file_id=full_file_id
            )
        except Exception as e:
            logger.warning(f"send_cached_media failed: {e}")
            raise web.HTTPNotFound(text="Resource not found")

        if not stored_msg:
            raise web.HTTPNotFound(text="Resource not found")

        record = build_file_record(stored_msg)
        if not record:
            try:
                await stored_msg.delete()
            except Exception:
                pass
            raise web.HTTPNotFound(text="Resource not found")

        pub_hash = record["public_hash"]

        existing = await get_file_by_hash(pub_hash, raise_on_error=False)
        if existing:
            try:
                await stored_msg.delete()
            except Exception:
                pass
            record = existing
        else:
            try:
                await db.create_file_record(record)
            except Exception as e:
                logger.warning(f"create_file_record failed for {pub_hash}: {e}")
                existing = await get_file_by_hash(pub_hash, raise_on_error=False)
                if existing:
                    record = existing

        file_name = record.get("file_name") or name
        redirect_url = f"/watch/f/{pub_hash}/{quote(file_name, safe='')}"
        raise web.HTTPFound(redirect_url)

    except web.HTTPException:
        raise
    except Exception as e:
        error_id = secrets.token_hex(6)
        logger.error(f"watch_by_file_id error {error_id}: {e}", exc_info=True)
        raise web.HTTPInternalServerError(text=f"Server error: {error_id}") from e



@routes.get(r"/{path:.+}", allow_head=True)
async def media_delivery(request: web.Request):
    try:
        path = request.match_info["path"]
        message_id, secure_hash = parse_media_request(path, request.query)

        client_id, streamer = select_optimal_client()

        work_loads[client_id] += 1

        try:
            file_info = await streamer.get_file_info(message_id)
            unique_id = _resolve_unique_id(file_info)

            if unique_id[:SECURE_HASH_LENGTH] != secure_hash:
                raise InvalidHash(
                    "Provided hash does not match file's unique ID.")
            return await _serve_media_response(
                request,
                file_info=file_info,
                streamer=streamer,
                client_id=client_id,
                media_ref=message_id
            )

        except (FileNotFound, InvalidHash):
            work_loads[client_id] -= 1
            raise
        except Exception as e:
            work_loads[client_id] -= 1
            error_id = secrets.token_hex(6)
            logger.error(
                f"Stream error {error_id}: {e}",
                exc_info=True)
            raise web.HTTPInternalServerError(
                text=f"Server error during streaming: {error_id}") from e

    except (InvalidHash, FileNotFound) as e:
        logger.debug(f"Client error: {type(e).__name__} - {e}", exc_info=True)
        raise web.HTTPNotFound(text="Resource not found") from e
    except Exception as e:
        error_id = secrets.token_hex(6)
        logger.error(f"Server error {error_id}: {e}", exc_info=True)
        raise web.HTTPInternalServerError(
            text=f"An unexpected server error occurred: {error_id}") from e
