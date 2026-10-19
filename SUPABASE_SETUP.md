# Connect Supabase (optional but recommended)

Without Supabase the app still works fully in **Local mode** (data saved in your browser).

## 1. Create a free Supabase project
1. Go to https://supabase.com → New project
2. Wait until the project is ready

## 2. Run the schema
1. In Supabase open **SQL Editor**
2. Paste the contents of `supabase-schema.sql` and click **Run**

## 3. Add your keys
1. Go to **Project Settings → API**
2. Copy **Project URL** and **anon public** key
3. Create a file `.env` in the project root:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 4. Restart
```bash
npm install
npm run dev
```

The header will show **Supabase connected** when it works.
