# Permit Portal - Quick Start (For Darius)

**Time to Launch**: ~45 minutes
**Difficulty**: Easy (follow step-by-step)
**Status**: MVP Ready ✅

---

## What You Need to Do

### 1. Create Supabase Account (5 min)
- Go to [supabase.com](https://supabase.com)
- Sign up or log in
- Create new project "permit-portal"
- Save the password somewhere safe
- Wait for it to be created (2-3 min)

### 2. Create Google OAuth App (10 min)
- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Create new project
- Search for "Google+ API" and enable it
- Go to Credentials → Create OAuth Client ID (Web application)
- Add these redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://permit-portal.vercel.app/api/auth/callback/google`

### 3. Get Claude API Key (2 min)
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create API key
- Copy it

### 4. Get API Keys from Services (5 min)

**From Supabase:**
- Go to Project Settings → API
- Copy these values:
  - Project URL
  - anon public (key)
  - service_role (secret key)

### 5. Generate NextAuth Secret (1 min)

Run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output.

### 6. Set Up Local Environment (2 min)

In the permit-portal folder:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and paste your secrets:
# - NEXTAUTH_SECRET (from step 5)
# - GOOGLE_ID (from step 2)
# - GOOGLE_SECRET (from step 2)
# - Supabase URLs and keys (from step 4)
# - ANTHROPIC_API_KEY (from step 3)
```

### 7. Deploy Database (5 min)

In Supabase:
- Go to SQL Editor
- Click "New Query"
- Copy entire contents of `sql-schema.sql` from permit-portal folder
- Paste into editor
- Click "Run"
- Wait for success

### 8. Test Locally (5 min)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
# Test Google login button
# Test email/password form
```

### 9. Deploy to Vercel (10 min)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your permit-portal repo
5. Add environment variables (same as .env.local):
   - NEXTAUTH_SECRET
   - GOOGLE_ID
   - GOOGLE_SECRET
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - ANTHROPIC_API_KEY
6. Click "Deploy"
7. Wait for build (3-5 min)

### 10. Update Google OAuth for Production (2 min)

In Google Console:
- Add this redirect URI:
  - `https://your-vercel-domain.com/api/auth/callback/google`

### 11. Test Production (3 min)

- Visit your Vercel domain
- Test Google login
- Test admin dashboard at `/admin`

---

## You're Launching! 🚀

**Portal URL**: https://permit-portal.vercel.app (or your custom domain)

**Share with customers:**
- "Visit [portal-url] to manage your permits"
- "Log in with Google or email/password"

**Share with team:**
- "Visit [portal-url]/admin to manage permits"
- "Track workflow and update status"
- "AI automatically detects missing documents"

---

## After Launch

### Add County Pricing (Team Task)

Contact Rhya for:
- County permit costs
- Processing times
- Required documents

Then enter via Admin Dashboard → County Pricing tab.

### Invite Team Members

1. Add email addresses to database
2. Team members can log in with email/password
3. They access admin dashboard immediately

### Monitor Performance

- Watch Vercel dashboard for errors
- Check Supabase logs for database issues
- Monitor Claude API usage

---

## Troubleshooting

**"Invalid Client ID"?**
- Verify Google Client ID is correct
- Check redirect URIs in Google Console

**"Can't connect to database"?**
- Verify Supabase URL and API keys
- Check database tables exist

**"Claude not working"?**
- Verify API key in .env.local
- Check Claude API console for quota

---

## Files You Need

- `SETUP.md` - Detailed step-by-step guide
- `README.md` - Features overview
- `DEPLOYMENT_CHECKLIST.md` - Before launch verification
- `sql-schema.sql` - Database schema to deploy
- `.env.local.example` - Environment variable template

---

## Support

All documentation is in the permit-portal folder:
- Questions? → See README.md
- How do I...? → See SETUP.md
- Before launching? → See DEPLOYMENT_CHECKLIST.md

---

**Status**: Ready to build
**Next Step**: Start with "Create Supabase Account" above
**Estimated Time**: 45 minutes total
**Help**: All detailed docs included in permit-portal folder

You've got this! 💪
