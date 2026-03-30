# Permit Portal - Deployment Checklist

## Pre-Launch Checklist

### Supabase
- [ ] Supabase project created
- [ ] Database schema deployed (sql-schema.sql)
- [ ] API keys copied to environment variables
- [ ] Row-level security (RLS) policies configured (if needed)
- [ ] Backups enabled

### Google OAuth
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs include localhost AND production domain
- [ ] Client ID and Secret in environment variables

### Claude API
- [ ] Anthropic account created
- [ ] API key generated
- [ ] API key in environment variables
- [ ] Rate limits understood

### Environment Variables
- [ ] `.env.local` created locally with all required vars
- [ ] All secrets are securely stored (never committed to git)
- [ ] Vercel environment variables match local
- [ ] `NEXTAUTH_URL` points to correct domain (localhost locally, domain on Vercel)

### Code Quality
- [ ] No console errors or warnings
- [ ] No hardcoded secrets in code
- [ ] TypeScript compilation succeeds
- [ ] All imports resolved

### Testing
- [ ] Local development server starts without errors
- [ ] Google login works locally
- [ ] Email/password form loads
- [ ] Dashboard renders after login
- [ ] All 3 tabs (Processing/Active/Declined) accessible
- [ ] Admin dashboard accessible at /admin
- [ ] AI analysis triggers on permit submission

### Vercel Deployment
- [ ] Repository pushed to GitHub
- [ ] Vercel project created and connected
- [ ] Environment variables added to Vercel
- [ ] Build succeeds without errors
- [ ] Production deployment succeeds
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate active

### Post-Launch
- [ ] Test login on production domain
- [ ] Test permit submission on production
- [ ] Verify database records created in Supabase
- [ ] Check Claude API logs for successful calls
- [ ] Monitor Vercel analytics for errors

---

## Team Setup

- [ ] Rhya contacted for county permit pricing data
- [ ] Admin team members added to `team_members` table
- [ ] Team emails provided access instructions
- [ ] Document storage (S3/Supabase Storage) configured

---

## Customer Communication

- [ ] Customer portal URL shared with clients
- [ ] Login instructions provided
- [ ] Support email/contact info configured
- [ ] Welcome email template created

---

## Monitoring & Maintenance

- [ ] Error tracking set up (Sentry, LogRocket, etc.)
- [ ] Database backups automated
- [ ] API rate limits monitored
- [ ] Team training completed

---

## Go-Live Sign-Off

- **Built By**: Asher AI
- **Reviewed By**: ___________
- **Approved By**: Darius Walton
- **Launch Date**: 2026-03-30
- **Production URL**: _______________

---

## Post-Launch Support

**Critical Issues**: Contact development team immediately
**Feature Requests**: Document in GitHub issues
**Performance Issues**: Check Vercel Analytics and Supabase logs

---

## Phase 2 Roadmap (Next Week)

- [ ] Payment processing (Stripe)
- [ ] Email notifications
- [ ] Document uploads to cloud storage
- [ ] Team member assignment
- [ ] Advanced analytics
- [ ] Integration with county systems (if available)

---

**Status**: Ready for Launch ✅
**Last Updated**: 2026-03-30 09:25 EDT
