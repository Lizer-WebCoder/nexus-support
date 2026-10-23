#!/usr/bin/env python3
"""Merge origin/main into kirzhian and resolve App.tsx + LoginPage.tsx."""
import subprocess
from pathlib import Path

subprocess.check_call(['git', 'fetch', 'origin', 'main'])
r = subprocess.run(['git', 'merge', 'origin/main', '--no-edit'], capture_output=True, text=True)
print(r.stdout)
print(r.stderr)
# Even if conflicts, continue to write resolved files

app = Path('scripts/_App_merged.tsx')
if app.exists():
    Path('src/App.tsx').write_text(app.read_text())
    print('wrote resolved App.tsx')
else:
    raise SystemExit('missing scripts/_App_merged.tsx')

# LoginPage: keep kirzhian version (already on disk if conflict, or checkout --ours)
subprocess.run(['git', 'checkout', '--ours', 'src/components/LoginPage.tsx'], check=False)
# ensure markJustLoggedIn is present
lp = Path('src/components/LoginPage.tsx').read_text()
if 'markJustLoggedIn' not in lp:
    print('WARN: LoginPage missing markJustLoggedIn')
else:
    print('LoginPage kept (kirzhian)')

subprocess.check_call(['git', 'add', 'src/App.tsx', 'src/components/LoginPage.tsx'])
# add any other resolved files
subprocess.run(['git', 'add', '-u'], check=False)
status = subprocess.check_output(['git', 'status', '--porcelain'], text=True)
print(status)
if 'UU' in status or 'AA' in status:
    # force add remaining conflicted as ours for non-app login
    for line in status.splitlines():
        if line.startswith('UU ') or line.startswith('AA '):
            p = line[3:].strip()
            if p not in ('src/App.tsx', 'src/components/LoginPage.tsx'):
                subprocess.run(['git', 'checkout', '--ours', p], check=False)
                subprocess.run(['git', 'add', p], check=False)
                print('ours', p)

# Commit merge if in progress
subprocess.run(['git', 'commit', '--no-edit', '-m', 'Merge origin/main into kirzhian; resolve App + LoginPage'], check=False)
print('done')
