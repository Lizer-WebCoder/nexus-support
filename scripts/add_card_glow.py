#!/usr/bin/env python3
"""Add soft violet–fuchsia outer glow to login + registration glass cards."""
from pathlib import Path

p = Path("src/index.css")
t = p.read_text()
if len(t) < 200 or t.strip() == "PLACEHOLDER":
    raise SystemExit("css empty")

old = """.login-glass-card {
  background: linear-gradient(
    155deg,
    rgba(98, 32, 150, 0.22) 0%,
    rgba(40, 12, 70, 0.28) 40%,
    rgba(18, 6, 42, 0.32) 100%
  );
  backdrop-filter: blur(18px) saturate(1.25);
  -webkit-backdrop-filter: blur(18px) saturate(1.25);
  border: 1px solid rgba(216, 180, 254, 0.22);
  box-shadow:
    0 16px 40px rgba(0, 0, 20, 0.4),
    0 0 0 1px rgba(139, 92, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}"""

new = """.login-glass-card {
  background: linear-gradient(
    155deg,
    rgba(98, 32, 150, 0.22) 0%,
    rgba(40, 12, 70, 0.28) 40%,
    rgba(18, 6, 42, 0.32) 100%
  );
  backdrop-filter: blur(18px) saturate(1.25);
  -webkit-backdrop-filter: blur(18px) saturate(1.25);
  border: 1px solid rgba(216, 180, 254, 0.28);
  box-shadow:
    0 0 0 1px rgba(167, 139, 250, 0.15),
    0 0 24px 4px rgba(139, 92, 246, 0.35),
    0 0 48px 8px rgba(192, 38, 211, 0.22),
    0 0 80px 12px rgba(99, 102, 241, 0.12),
    0 20px 44px rgba(0, 0, 20, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  animation: login-card-glow 4.5s ease-in-out infinite alternate;
}

@keyframes login-card-glow {
  from {
    box-shadow:
      0 0 0 1px rgba(167, 139, 250, 0.12),
      0 0 20px 3px rgba(139, 92, 246, 0.28),
      0 0 40px 6px rgba(192, 38, 211, 0.16),
      0 0 70px 10px rgba(99, 102, 241, 0.08),
      0 20px 44px rgba(0, 0, 20, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  to {
    box-shadow:
      0 0 0 1px rgba(216, 180, 254, 0.22),
      0 0 28px 6px rgba(167, 139, 250, 0.42),
      0 0 56px 12px rgba(217, 70, 239, 0.28),
      0 0 90px 16px rgba(129, 140, 248, 0.16),
      0 22px 48px rgba(0, 0, 20, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.14);
  }
}"""

if old in t:
    t = t.replace(old, new)
    print("glow applied")
elif "login-card-glow" in t:
    print("glow already present")
else:
    raise SystemExit("glass block not found")

p.write_text(t)
print("css bytes", len(t), "login-card-glow" in t)
