import os
from os import path as opath, getenv, rename
from subprocess import run as srun
from dotenv import load_dotenv
from PageStream.utils.logger import logger

load_dotenv('config.env', override=True)

UPSTREAM_REPO   = getenv('UPSTREAM_REPO', "").strip()
UPSTREAM_BRANCH = getenv('UPSTREAM_BRANCH', "main").strip()

if not UPSTREAM_REPO:
    logger.info("UPSTREAM_REPO not set — skipping auto-update.")
else:
    config_backup = '../config.env.tmp'
    git_dir_backup = '../git_backup.tmp'

    try:
        # Back up config.env
        if opath.exists('config.env'):
            rename('config.env', config_backup)

        # Remove stale .git if present
        if opath.exists('.git'):
            srun(["rm", "-rf", ".git"], check=True)

        git_commands = (
            f"git init -q && "
            f"git config --global user.email pagestream@update.local && "
            f"git config --global user.name PageStream && "
            f"git add . && "
            f"git commit -sm update -q && "
            f"git remote add origin {UPSTREAM_REPO} && "
            f"git fetch origin -q && "
            f"git reset --hard origin/{UPSTREAM_BRANCH} -q"
        )

        result = srun(git_commands, shell=True)

        if result.returncode == 0:
            logger.info('Successfully updated from UPSTREAM_REPO.')
        else:
            logger.error(
                'git update failed (returncode %d). '
                'Bot will start with current code.',
                result.returncode
            )

    except Exception as exc:
        logger.error('Unexpected error during update: %s', exc, exc_info=True)

    finally:
        # Always restore config.env
        if opath.exists(config_backup):
            rename(config_backup, 'config.env')
