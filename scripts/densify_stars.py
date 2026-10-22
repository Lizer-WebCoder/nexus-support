#!/usr/bin/env python3
"""Densify login galaxy starfield to 180 particles with 4 depth layers."""
from pathlib import Path
import re

p = Path("src/components/LoginPage.tsx")
if not p.exists() or p.stat().st_size < 1000:
    raise SystemExit("LoginPage.tsx missing or empty")

t = p.read_text()

old = """function useFallingStars(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 41 + 13) % 100}%`,
        size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
        delay: -((i * 0.37) % 20),
        duration: 8 + (i % 11) * 1.4,
        color: i % 4 === 0 ? '#ff66cc' : i % 3 === 0 ? '#66f0ff' : '#c4b5fd',
        opacity: 0.35 + (i % 6) * 0.1,
      })),
    [count]
  );
}"""

new = """function useFallingStars(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const layer = i % 4;
        const size =
          layer === 0
            ? 0.7 + (i % 3) * 0.2
            : layer === 1
              ? 1.1 + (i % 4) * 0.3
              : layer === 2
                ? 1.7 + (i % 5) * 0.35
                : i % 7 === 0
                  ? 4.2
                  : 2.2 + (i % 4) * 0.45;
        const duration =
          layer === 0
            ? 20 + (i % 12) * 2.6
            : layer === 1
              ? 14 + (i % 10) * 1.9
              : layer === 2
                ? 9 + (i % 8) * 1.5
                : 6 + (i % 7) * 1.15;
        const colors = [
          '#c4b5fd', '#a78bfa', '#66f0ff', '#ff66cc', '#e9d5ff',
          '#f0abfc', '#93c5fd', '#ddd6fe', '#f5d0fe', '#a5f3fc',
          '#fce7f3', '#e0e7ff',
        ];
        return {
          id: i,
          left: `${(i * 41 + 13 + layer * 11) % 100}%`,
          size,
          delay: -((i * 0.21 + layer * 1.4) % (duration * 0.95)),
          duration,
          color: colors[i % colors.length],
          opacity:
            layer === 0
              ? 0.1 + (i % 5) * 0.035
              : layer === 1
                ? 0.2 + (i % 6) * 0.05
                : layer === 2
                  ? 0.4 + (i % 5) * 0.08
                  : 0.6 + (i % 4) * 0.1,
          blur: layer === 0 ? 1.1 : layer === 1 ? 0.5 : 0,
        };
      }),
    [count]
  );
}"""

if old in t:
    t = t.replace(old, new)
    print("generator expanded")
else:
    print("generator pattern not found (maybe already patched)")

t2, n = re.subn(r"useFallingStars\(\d+\)", "useFallingStars(180)", t, count=1)
print("count replacements", n)
t = t2

old_span = "boxShadow: `0 0 ${s.size * 3}px ${s.color}`"
new_span = "boxShadow: `0 0 ${s.size * 4}px ${s.color}, 0 0 ${s.size * 10}px ${s.color}40`, filter: s.blur ? `blur(${s.blur}px)` : undefined"
if old_span in t:
    t = t.replace(old_span, new_span)
    print("glow enhanced")

p.write_text(t)
print("ok", "useFallingStars(180)" in t, len(t))
