#!/usr/bin/env python3
"""Rebuild LoginPage.tsx from base64 part files on kirzhian."""
from pathlib import Path
import base64
root = Path(__file__).resolve().parents[1]
parts_dir = root / "scripts" / "payload"
parts = sorted(parts_dir.glob("login_part*.b64"))
if not parts:
    raise SystemExit("No login_part*.b64 found")
data = "".join(p.read_text().strip() for p in parts)
out = root / "src" / "components" / "LoginPage.tsx"
out.write_bytes(base64.b64decode(data))
print("Wrote", out, "bytes", out.stat().st_size)
