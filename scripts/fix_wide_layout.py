#!/usr/bin/env python3
"""Widen layout for ultra-wide monitors; narrow login/registration cards."""
from pathlib import Path

p = Path('src/components/LoginPage.tsx')
t = p.read_text()
if len(t) < 500:
    raise SystemExit('LoginPage empty')

repls = [
    (
        'w-full max-w-6xl xl:max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 px-5 sm:px-8 lg:px-10 xl:px-12 py-8 lg:py-12 items-center',
        'w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] gap-10 lg:gap-14 xl:gap-20 2xl:gap-28 px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 lg:py-12 items-center',
    ),
    (
        'login-glass-card w-full max-w-[400px] sm:max-w-[420px] lg:max-w-none rounded-2xl p-6 sm:p-8',
        'login-glass-card w-full max-w-[360px] sm:max-w-[380px] rounded-2xl p-5 sm:p-7',
    ),
    (
        'login-glass-card w-full max-w-[400px] sm:max-w-[440px] lg:max-w-none rounded-2xl p-6 sm:p-8 border border-fuchsia-300/20 shadow-[0_0_40px_rgba(139,92,246,0.15)]',
        'login-glass-card w-full max-w-[360px] sm:max-w-[380px] rounded-2xl p-5 sm:p-7 border border-fuchsia-300/15',
    ),
    (
        'flex items-center justify-center lg:justify-end order-1 lg:order-2',
        'flex items-center justify-center lg:justify-end order-1 lg:order-2 w-full lg:w-auto',
    ),
]

for old, new in repls:
    if old not in t:
        print('skip missing:', old[:60])
        continue
    t = t.replace(old, new)
    print('applied:', new[:50])

p.write_text(t)
print('done', len(t), 'max-w-[1600px]' in t, 'max-w-[360px]' in t)
