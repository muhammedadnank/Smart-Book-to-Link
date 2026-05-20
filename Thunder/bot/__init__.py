# Thunder/bot/__init__.py
#
# NOTE: pyrofork installs itself under the `pyrogram` namespace.
# We import from `pyrogram` here because that is the namespace pyrofork
# exposes at runtime. The pyrofork package must be listed in requirements.txt
# (NOT pyrogram) to ensure the fork — not the upstream — is installed.

from pyrogram import Client
from Thunder.vars import Var

StreamBot = Client(
    name="Web Streamer",
    api_id=Var.API_ID,
    api_hash=Var.API_HASH,
    bot_token=Var.BOT_TOKEN,
    sleep_threshold=Var.SLEEP_THRESHOLD,
    workers=Var.WORKERS
)

multi_clients: dict = {}
work_loads: dict = {}
