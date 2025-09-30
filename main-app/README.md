# Main Application

This is the main Next.js application with Auth.js and Supabase integration.

## Features

- Next.js 15 with App Router
- Authentication using Auth.js (NextAuth.js)
- Supabase for database and authentication
- Stripe checkout integration
- TypeScript support

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `NEXTAUTH_URL`: Your app URL (default: http://localhost:3000)
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key

## Database Schema

Create these tables in your Supabase database:

### customers table
```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### subscriptions table
```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Structure

- `/app` - Next.js app directory
  - `/api/auth/[...nextauth]` - NextAuth.js route handler
  - `/api/create-checkout` - Stripe checkout session creation
  - `/login` - Login page
  - `/dashboard` - Protected dashboard page
- `/lib` - Utility libraries
  - `supabase.ts` - Supabase client configuration
  - `stripe.ts` - Stripe client configuration

## Notes

- This app works in conjunction with the webhook service (see `/webhook-service`)
- The webhook service handles all Stripe webhook events and updates the Supabase database
- Authentication is managed by Auth.js with Supabase as the backend
