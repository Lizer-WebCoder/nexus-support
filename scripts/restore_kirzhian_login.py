#!/usr/bin/env python3
import base64, gzip, json
from pathlib import Path

meta = json.loads(Path("scripts/kirzhian_payload/meta.json").read_text())

def load(prefix, n):
    parts = [Path(f"scripts/kirzhian_payload/{prefix}_part{i}.txt").read_text().strip() for i in range(n)]
    return gzip.decompress(base64.b64decode("".join(parts)))

Path("src/context/AuthContext.tsx").write_bytes(load("auth", meta["auth_parts"]))
Path("src/components/LoginPage.tsx").write_bytes(load("login", meta["login_parts"]))
print("restored AuthContext + LoginPage")
print("LoginPage has Create your account:", b"Create your account" in Path("src/components/LoginPage.tsx").read_bytes())
