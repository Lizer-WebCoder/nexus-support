# Supabase setup (agent accounts + cloud data)

## 1. Create a project
1. Go to [supabase.com](https://supabase.com) → **New project**
2. Wait until the database is ready

## 2. Run the schema
1. Open **SQL Editor** → New query
2. Paste everything from `supabase-schema.sql`
3. Click **Run**

## 3. Auth settings (recommended for agents)
1. **Authentication → Providers → Email** → enabled
2. Optional: disable **Confirm email** while testing  
   (Authentication → Providers → Email → **Confirm email** off)
3. Under **Authentication → URL Configuration**, add your site URL:  
   `https://lizer-webcoder.github.io/nexus-support/`

## 4. Create the first agent user
**Option A — in the app**  
After keys are set, open the agent app → **Create account** with a work email.

**Option B — in Supabase**  
Authentication → Users → **Add user** → email + password.

## 5. Env keys in the frontend
Copy **Project URL** and **anon public** key from **Project Settings → API**.

### Local development
Create `.env` in the project root:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Then:

```bash
npm install
npm run dev
```

### GitHub Pages (production)
Vite bakes env vars at **build time**. For GitHub Actions:

1. Repo → **Settings → Secrets and variables → Actions**
2. Add secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Update `.github/workflows/deploy.yml` build step to pass them (see below)

```yaml
- name: Build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  run: npx vite build
```

## 6. How access works
| Surface | Auth |
|---------|------|
| **Customer portal** (`#/portal`) | Public — submit & track tickets |
| **Agent Command Center** | Requires Supabase login when keys are configured |
| **Local mode** (no keys) | No login; data stays in the browser |

## 7. Verify
1. Open agent URL → Sign in / Create account
2. Open `#/portal` → submit a ticket without logging in
3. Back in agent view → ticket appears in the list
