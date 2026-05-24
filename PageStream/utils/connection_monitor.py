# PageStream/utils/connection_monitor.py
# Ported & adapted from filestreambot (EL-Coders/filestreambot)

import asyncio
import os
import sys

from PageStream.bot import StreamBot, multi_clients
from PageStream.utils.logger import logger


_CHECK_INTERVAL = int(os.environ.get("CONNECTION_CHECK_INTERVAL", 300))  # 5 min default
_MAX_FAILURES   = 3


def _emergency_restart(reason: str) -> None:
    """Hard restart the process — identical strategy to filestreambot."""
    logger.critical("Emergency restart triggered: %s", reason)
    os.execv(sys.executable, [sys.executable] + sys.argv)


async def _check_single_client(client, label: str) -> bool:
    """Return True if the client is alive, False otherwise."""
    try:
        await client.get_me()
        return True
    except ConnectionError:
        logger.error("ConnectionError for %s", label)
        return False
    except Exception as exc:
        msg = str(exc)
        if "Cannot send requests while disconnected" in msg or "Session" in msg:
            logger.error("Disconnection detected for %s: %s", label, msg)
            return False
        # FloodWait, RPCError etc. — client is alive, just throttled
        logger.warning("Non-fatal error for %s: %s", label, msg)
        return True


async def monitor_connections() -> None:
    """
    Background coroutine that periodically pings StreamBot + all multi_clients.
    After _MAX_FAILURES consecutive all-failed checks it calls _emergency_restart().
    Designed to be run as an asyncio.Task alongside idle().
    """
    consecutive_failures = 0

    logger.info(
        "Connection monitor started — interval=%ds, max_failures=%d",
        _CHECK_INTERVAL, _MAX_FAILURES,
    )

    while True:
        try:
            await asyncio.sleep(_CHECK_INTERVAL)

            # Check main bot
            main_ok = await _check_single_client(StreamBot, "StreamBot (main)")

            # Check every additional client
            extra_results: list[bool] = []
            for cid, client in multi_clients.items():
                if client is StreamBot:
                    continue
                ok = await _check_single_client(client, f"Client-{cid}")
                extra_results.append(ok)

            total_extra   = len(extra_results)
            healthy_extra = sum(extra_results)

            all_healthy = main_ok and (total_extra == 0 or healthy_extra > 0)

            if all_healthy:
                consecutive_failures = 0
                logger.info(
                    "Connection check OK — main=%s, extra=%d/%d",
                    "✓" if main_ok else "✗",
                    healthy_extra, total_extra,
                )
            else:
                consecutive_failures += 1
                logger.warning(
                    "Connection check FAILED (%d/%d) — main=%s, extra=%d/%d",
                    consecutive_failures, _MAX_FAILURES,
                    "✓" if main_ok else "✗",
                    healthy_extra, total_extra,
                )

                if consecutive_failures >= _MAX_FAILURES:
                    _emergency_restart(
                        f"Connection failed {consecutive_failures} times in a row"
                    )

        except asyncio.CancelledError:
            logger.debug("connection_monitor cancelled cleanly.")
            break
        except Exception as exc:
            logger.error("Unexpected error in connection_monitor: %s", exc, exc_info=True)
            await asyncio.sleep(60)
