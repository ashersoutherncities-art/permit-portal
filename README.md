# Permit Portal - Southern Cities Construction

A comprehensive permit management system for Southern Cities Construction, enabling customers to track permits online and teams to manage the complete workflow.

## Features

### User Portal
- **Authentication**: Google OAuth + email/password login
- **Three Status Tabs**:
  - **Processing**: Permits under review with AI-detected missing items
  - **Active**: Submitted permits with real-time status updates
  - **Declined**: Rejected permits with detailed feedback
- **Document Management**: Upload and manage required documents
- **Payment Tracking**: View upfront fees and payment status

### Admin Dashboard
- **Permit Management**: View and manage all customer permits
- **Workflow Management**: Move permits through workflow stages with notes
- **AI Analysis**: Automatic detection of missing documents and information
- **County Pricing Database**: Maintain permit costs by county and type
- **Analytics**: Track key metrics (processed permits, pending, revenue, etc.)

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: NextAuth.js (Google OAuth + credentials)
- **AI Analysis**: Claude API
- **Deployment**: Vercel

## Setup Instructions

### 1. Environment Variables

Create `.env.local` based on `.env.local.example`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret

# Google OAuth
GOOGLE_ID=your-google-id
GOOGLE_SECRET=your-google-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Claude API
ANTHROPIC_API_KEY=your-anthropic-key
```

### 2. Database Setup (Supabase)

1. Create a new Supabase project
2. Run the SQL schema from `sql-schema.sql` in Supabase SQL editor
3. Copy your Supabase URL and API keys to `.env.local`

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new OAuth 2.0 application
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://yourdomain.com/api/auth/callback/google` (production)
4. Copy Client ID and Secret to `.env.local`

### 4. Claude API Setup

1. Get API key from [Anthropic Console](https://console.anthropic.com)
2. Add to `.env.local` as `ANTHROPIC_API_KEY`

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel project settings
4. Deploy

## API Endpoints

### Permits
- `GET /api/permits` - List user's permits
- `POST /api/permits` - Create new permit (triggers AI analysis)
- `GET /api/permits/[id]` - Get permit details
- `PATCH /api/permits/[id]` - Update permit status

### Analytics (Coming Soon)
- `GET /api/admin/analytics` - Get dashboard metrics
- `GET /api/admin/pricing` - Manage county pricing
- `GET /api/admin/reports` - Generate reports

## Workflow Stages

Permits move through these stages:
1. **Submitted** - Initial submission
2. **Information Retrieval** - Gathering missing docs
3. **Under Preparation** - Team preparing submission
4. **Submitted to County** - Sent to government
5. **Awaiting Approval** - Government reviewing
6. **Inspection Scheduled** - Inspection date set
7. **Inspection Passed** → **CLOSED**
8. Or: **Inspection Failed** → Revisions needed

## AI Analysis Features

The Claude API automatically analyzes each submission to detect:
- Missing property documents
- Incomplete contractor information
- Missing scope details
- Unsigned contracts
- Outstanding payments

## Next Steps (Phase 2)

- [ ] Payment processing (Stripe integration)
- [ ] Email notifications
- [ ] Document storage & management
- [ ] Team member assignment
- [ ] Advanced analytics by county
- [ ] Government API integration
- [ ] Inspection scheduling

## Support

For questions or issues, contact the development team.
