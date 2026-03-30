# Permit Portal - Complete Setup Guide

## Overview

This guide covers all setup steps needed to get the Permit Portal running locally and deployed to Vercel.

**Estimated Time**: 30-45 minutes
**Complexity**: Intermediate

---

## Prerequisites

- Node.js 18+ and npm
- GitHub account
- Vercel account
- Google Cloud account
- Supabase account
- Anthropic API account

---

## Step 1: Clone & Install

```bash
# Clone the repository
git clone <repo-url> permit-portal
cd permit-portal

# Install dependencies
npm install
```

---

## Step 2: Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: permit-portal
   - **Database Password**: Save securely
   - **Region**: Choose closest to Charlotte, NC (us-east-1)
4. Wait for project to be created (2-3 minutes)

### Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `sql-schema.sql` from the project
4. Paste into the query editor and click **Run**

### Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Google OAuth Setup

### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**:
   - Search for "Google+ API"
   - Click Enable
4. Create OAuth 2.0 credentials:
   - Go to **Credentials**
   - Click **+ Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://permit-portal.vercel.app/api/auth/callback/google` (update with your domain)

### Copy Credentials

- Copy **Client ID** → `GOOGLE_ID`
- Copy **Client Secret** → `GOOGLE_SECRET`

---

## Step 4: Anthropic API Setup

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Navigate to **API Keys**
3. Click **Create Key**
4. Name it "permit-portal"
5. Copy the key → `ANTHROPIC_API_KEY`

---

## Step 5: NextAuth Secret

Generate a secure secret:

```bash
# Using openssl
openssl rand -base64 32

# Or using node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output → `NEXTAUTH_SECRET`

---

## Step 6: Environment Variables

1. Create `.env.local` in the project root:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<paste-generated-secret>

# Google OAuth
GOOGLE_ID=<paste-google-client-id>
GOOGLE_SECRET=<paste-google-client-secret>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<paste-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<paste-service-role-key>

# Claude API
ANTHROPIC_API_KEY=<paste-anthropic-key>
```

---

## Step 7: Test Locally

```bash
# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

**Test the following:**

1. **Login Page** loads at http://localhost:3000
2. Click **Google** button → Should redirect to Google login
3. After Google login → Should redirect to /dashboard
4. Try **Email/Password** login (will fail since no user exists, but should load form)

---

## Step 8: Deploy to Vercel

### Connect Repository

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **New Project**
4. Import your GitHub repository
5. Select "Next.js" as framework

### Add Environment Variables

In Vercel project settings, go to **Environment Variables** and add:

- `NEXTAUTH_URL` = `https://permit-portal.vercel.app` (or your domain)
- `NEXTAUTH_SECRET` = (same as local)
- `GOOGLE_ID` = (same as local)
- `GOOGLE_SECRET` = (same as local)
- `NEXT_PUBLIC_SUPABASE_URL` = (same as local)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (same as local)
- `SUPABASE_SERVICE_ROLE_KEY` = (same as local)
- `ANTHROPIC_API_KEY` = (same as local)

### Update Google OAuth

Update Google OAuth credentials to include Vercel redirect URI:

- `https://your-vercel-domain.com/api/auth/callback/google`

### Deploy

Click **Deploy** button and wait for build to complete.

---

## Step 9: Test Production

1. Visit your Vercel domain
2. Test Google login
3. Test permit submission
4. Verify database records in Supabase SQL Editor

---

## Step 10: Add to Dashboard

Create a file `dashboard-entry.json`:

```json
{
  "name": "Permit Portal",
  "description": "Manage construction permits online",
  "url": "https://your-vercel-domain.com",
  "icon": "📋",
  "category": "Operations",
  "team": "Southern Cities Construction",
  "status": "active",
  "launched": "2026-03-30"
}
```

Add to dashboard configuration (per SOUL.md requirement).

---

## Troubleshooting

### "Invalid Client ID" Error

- Verify Google Client ID is correct
- Check redirect URIs match your domain
- Ensure GOOGLE_ID and GOOGLE_SECRET are set

### "Supabase Connection Failed"

- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Check SUPABASE_SERVICE_ROLE_KEY is valid
- Ensure database tables exist (run sql-schema.sql)

### "Claude API Error"

- Verify ANTHROPIC_API_KEY is correct
- Check API key has sufficient credits
- Review Anthropic console for rate limits

### Login Redirects to /

- Clear browser cookies
- Check NEXTAUTH_URL matches your domain
- Verify NEXTAUTH_SECRET is set

---

## Next Steps

1. **Add County Pricing Data**: Contact Rhya for permit costs by county
2. **Set Up Team Members**: Add team emails to `team_members` table
3. **Test Permit Submission**: Create test permit to verify AI analysis works
4. **Configure Email Notifications**: Set up Supabase functions for email
5. **Add Payment Processing**: Integrate Stripe for upfront fees

---

## Support

- **Permit Portal Docs**: See README.md
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth Docs**: https://next-auth.js.org

---

**Last Updated**: 2026-03-30
**Status**: MVP Complete
