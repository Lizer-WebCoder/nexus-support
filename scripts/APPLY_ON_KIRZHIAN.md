# Apply registration card on `kirzhian`

Run these commands on the **kirzhian** branch (do not merge to main until verified):

```bash
git checkout kirzhian
git pull origin kirzhian

# Restore full AuthContext from main (kirzhian copy was truncated)
git show origin/main:src/context/AuthContext.tsx > src/context/AuthContext.tsx

# Patch AuthContext (resetPassword) + LoginPage (separate register card)
python3 scripts/patch_auth_reset.py
python3 scripts/apply_reg_card.py

git add src/context/AuthContext.tsx src/components/LoginPage.tsx
git status
git commit -m "Login: separate registration card, visible Show, Forgot Password"
git push origin kirzhian
```

### What you get
1. **Sign-in card** and **Create your account** card are separate UIs
2. Registration: Full name, Email, Password, Confirm password, Agent/Customer toggle
3. **Show / Hide** on password fields uses brighter fuchsia text
4. **Forgot Password?** on Customer sign-in (sends Supabase reset email)
5. Subtitle under **Nexus Ops** title on the sign-in card
