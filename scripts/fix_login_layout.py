#!/usr/bin/env python3
"""Fix LoginPage layout for multi-resolution: full-width split, not centered max-w block."""
from pathlib import Path
import re

p = Path("src/components/LoginPage.tsx")
if not p.exists() or p.stat().st_size < 1000:
    raise SystemExit("LoginPage.tsx missing or empty")

t = p.read_text()

old_wrap = '''      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-6xl xl:max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 px-5 sm:px-8 lg:px-10 xl:px-12 py-8 lg:py-12 items-center">'''

new_wrap = '''      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] xl:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] gap-6 sm:gap-8 lg:gap-12 xl:gap-16 2xl:gap-20 px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 lg:py-10 xl:py-12 items-center max-w-[1600px] mx-auto">'''

if old_wrap in t:
    t = t.replace(old_wrap, new_wrap)
    print("layout wrapper updated")
else:
    alt = re.search(
        r'<div className="relative z-10 min-h-screen flex items-center[^"]*">\s*<div className="w-full max-w-[^"]+[^>]*>',
        t,
    )
    if alt:
        t = t[: alt.start()] + new_wrap.strip() + t[alt.end() :]
        print("layout wrapper updated (regex)")
    else:
        print("layout wrapper pattern not found")

old_left = '<div className="flex flex-col relative z-10 order-2 lg:order-1">'
new_left = '<div className="flex flex-col relative z-10 order-2 lg:order-1 lg:pr-4 xl:pr-8 min-w-0">'
if old_left in t:
    t = t.replace(old_left, new_left, 1)
    print("left column updated")

t = t.replace(
    '<div className="mt-8 lg:mt-12 max-w-lg">',
    '<div className="mt-8 lg:mt-12 max-w-lg xl:max-w-xl">',
    1,
)

old_right = '<div className="flex items-center justify-center lg:justify-end order-1 lg:order-2">'
new_right = '<div className="flex items-center justify-center lg:justify-end order-1 lg:order-2 w-full lg:w-auto">'
if old_right in t:
    t = t.replace(old_right, new_right, 1)
    print("right column updated")

t = t.replace(
    'login-glass-card w-full max-w-[400px] sm:max-w-[420px]',
    'login-glass-card w-full max-w-[400px] sm:max-w-[420px] lg:max-w-none',
    1,
)

t2, n = re.subn(r"useFallingStars\(\d+\)", "useFallingStars(180)", t, count=1)
if n:
    print("star count -> 180")
    t = t2

p.write_text(t)
print("ok", len(t))
