#!/usr/bin/env python3
"""Sync apps/landing/dist to hoster FTP using lftp + ~/.netrc."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def require(name: str) -> str:
    value = os.environ.get(name, "").strip()

    if not value:
        print(f"Missing {name}", file=sys.stderr)
        sys.exit(1)

    return value


def main() -> None:
    host = require("HOSTER_FTP_HOST")
    host = host.removeprefix("ftp://").removeprefix("ftps://").split("/", 1)[0]
    user = require("HOSTER_FTP_USER")
    password = require("HOSTER_FTP_PASSWORD")
    remote = os.environ.get("HOSTER_FTP_DIR", "").strip() or "."
    dist = Path("apps/landing/dist")

    if not dist.is_dir():
        print(f"Missing build output {dist}", file=sys.stderr)
        sys.exit(1)

    netrc = Path.home() / ".netrc"
    netrc.write_text(
        "machine "
        + host
        + "\nlogin "
        + user
        + "\npassword "
        + password
        + "\n"
    )
    netrc.chmod(0o600)

    script = Path("/tmp/deploy-landing.lftp")
    script.write_text(
        "\n".join(
            [
                "set cmd:fail-exit yes",
                "set net:max-retries 2",
                "set net:timeout 30",
                "set ftp:passive-mode yes",
                "set ftp:ssl-allow yes",
                "set ftp:ssl-protect-data yes",
                "set ssl:verify-certificate no",
                "open " + host,
                "lcd " + str(dist),
                "cd " + remote,
                "mirror --reverse --delete --verbose --exclude-glob .well-known/**",
                "bye",
                "",
            ]
        )
    )

    print("FTP host=" + host + " user=" + user)
    subprocess.run(["lftp", "-f", str(script)], check=True)


if __name__ == "__main__":
    main()
