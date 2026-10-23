#!/usr/bin/env python3
import base64
from pathlib import Path
parts = sorted(Path("scripts").glob("idx_b64_*.txt"), key=lambda p: int(p.stem.split("_")[-1]))
data = "".join(p.read_text().strip() for p in parts)
Path("src/index.css").write_bytes(base64.b64decode(data))
print("restored", Path("src/index.css").stat().st_size)
