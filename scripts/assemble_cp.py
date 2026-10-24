#!/usr/bin/env python3
from pathlib import Path
import base64
parts = [Path(f"scripts/cpb{i}.txt").read_text().strip() for i in range(4)]
raw = base64.b64decode("".join(parts))
Path("src/components/CustomerPortal.tsx").write_bytes(raw)
print("restored", len(raw))
t = raw.decode()
assert "export default function CustomerPortal" in t
assert "PortalLiveChat" in t
print("ok features present")
