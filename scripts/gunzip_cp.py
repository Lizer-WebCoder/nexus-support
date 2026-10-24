#!/usr/bin/env python3
import base64, gzip
from pathlib import Path
a = Path("scripts/cpgz_a.txt").read_text().strip()
b = Path("scripts/cpgz_b.txt").read_text().strip()
raw = gzip.decompress(base64.b64decode(a + b))
Path("src/components/CustomerPortal.tsx").write_bytes(raw)
print("restored", len(raw))
assert b"PortalLiveChat" in raw
print("ok")
