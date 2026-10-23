#!/usr/bin/env python3
"""Wrap AgentShell main UI in PostLoginShell (3s hold + fade)."""
from pathlib import Path

app_path = Path("src/App.tsx")
app = app_path.read_text()

app = app.replace(
    "import PostLoginLoader from './components/PostLoginLoader';",
    "import PostLoginLoader, { PostLoginShell } from './components/PostLoginLoader';",
)
if "PostLoginShell" not in app.split("import PostLoginLoader")[0] and "import PostLoginLoader, { PostLoginShell }" not in app:
    # already handled by replace if old import existed
    pass

if "agentReady" in app and "<PostLoginShell" in app:
    print("already wrapped")
    raise SystemExit(0)

old_start = """  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar"""

if old_start not in app:
    raise SystemExit("AgentShell return not found")

idx_return = app.find(old_start)
idx_root = app.find("\nfunction Root()")
if idx_return < 0 or idx_root < 0:
    raise SystemExit("markers missing")

chunk = app[idx_return:idx_root]
# chunk is:  return (\n    <div...\n  );\n}\n
inner = chunk.replace("  return (\n", "", 1)
# inner ends with );\n}\n
lines = inner.rstrip().split("\n")
if lines[-1].strip() == "}" and lines[-2].strip() == ");":
    lines.insert(-2, "    </PostLoginShell>")
    inner = "\n".join(lines) + "\n\n"
else:
    raise SystemExit(f"unexpected end: {lines[-4:]}")

new_chunk = (
    "  const agentReady = !requiresAuth || (!!user && accountRole !== 'customer' && !authLoading);\n\n"
    "  return (\n"
    "    <PostLoginShell\n"
    "      ready={agentReady}\n"
    "      label=\"Opening agent workspace…\"\n"
    "      subtitle=\"Loading your desk, tickets, and live chat.\"\n"
    "    >\n"
    + inner
)

app = app[:idx_return] + new_chunk + app[idx_root:]
app_path.write_text(app)
print("wrapped", len(app), app.count("PostLoginShell"))
