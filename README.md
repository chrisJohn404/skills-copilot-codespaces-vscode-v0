# Stripe & Supabase SaaS Starter Kit (Two-Part Architecture)

A modern SaaS starter kit with a two-part architecture, separating the main application from webhook processing for better scalability and maintainability.

## Architecture

This project consists of two separate applications:

1. **Main Application** (`/main-app`) - Port 3000
   - Next.js 15 with App Router
   - Auth.js (NextAuth.js) for authentication
   - Supabase for database and auth backend
   - Stripe checkout integration
   - User dashboard and subscription management

2. **Webhook Service** (`/webhook-service`) - Port 3001
   - Express.js server
   - Handles Stripe webhook events
   - Updates Supabase database
   - Manages subscription lifecycle

## Features

### Main Application
- ✅ User authentication with Auth.js + Supabase
- ✅ Protected routes and dashboard
- ✅ Stripe checkout session creation
- ✅ Subscription management UI
- ✅ TypeScript support
- ✅ Modern Next.js App Router

### Webhook Service
- ✅ Secure Stripe webhook handling
- ✅ Automatic subscription sync with Supabase
- ✅ Event processing (created, updated, deleted)
- ✅ Health check endpoint
- ✅ TypeScript support
- ✅ Scalable architecture

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Stripe account
- Git

### 1. Clone the repository

```bash
git clone <repository-url>
cd skills-copilot-codespaces-vscode-v0
```

### 2. Set up Supabase

Create the following tables in your Supabase database:

```sql
-- customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- subscriptions table
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

### 3. Set up Main Application

```bash
cd main-app
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

The main app will be available at http://localhost:3000

### 4. Set up Webhook Service

```bash
cd webhook-service
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

The webhook service will be available at http://localhost:3001

### 5. Set up Stripe Webhooks

For local development:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# For other platforms: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/webhook
```

Copy the webhook signing secret displayed by the CLI and add it to both `.env` files.

## Environment Variables

### Main Application

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

### Webhook Service

```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
PORT=3001
```

## Project Structure

```
.
├── main-app/                 # Next.js application
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # NextAuth.js routes
│   │   │   └── create-checkout/  # Stripe checkout
│   │   ├── login/          # Login page
│   │   ├── dashboard/      # Dashboard page
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── lib/                # Utility libraries
│   │   ├── supabase.ts    # Supabase client
│   │   └── stripe.ts      # Stripe client
│   └── package.json
│
├── webhook-service/         # Express webhook server
│   ├── src/
│   │   └── index.ts        # Main server file
│   └── package.json
│
└── README.md               # This file
```

## How It Works

1. **User Signs Up/In**: User authenticates through Auth.js, which uses Supabase as the backend
2. **User Subscribes**: User clicks "Subscribe Now" in the dashboard
3. **Checkout Creation**: Main app creates a Stripe checkout session and stores customer info in Supabase
4. **Payment**: User completes payment on Stripe's hosted checkout page
5. **Webhook Event**: Stripe sends webhook events to the webhook service
6. **Database Update**: Webhook service processes events and updates subscription status in Supabase
7. **User Sees Status**: User's subscription status is reflected in the dashboard

## Why Two Separate Applications?

### Benefits of Separation

1. **Scalability**: Each service can be scaled independently based on load
2. **Security**: Webhook secrets are isolated from the frontend application
3. **Reliability**: Webhook processing doesn't affect main app performance
4. **Maintainability**: Clear separation of concerns
5. **Deployment Flexibility**: Can be deployed to different environments/services
6. **Monitoring**: Easier to monitor and debug webhook-specific issues

### Deployment Options

- **Main App**: Vercel, Netlify, or any Next.js hosting platform
- **Webhook Service**: Railway, Render, Heroku, or any Node.js hosting platform

## Development

### Main App

```bash
cd main-app
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
```

### Webhook Service

```bash
cd webhook-service
npm run dev      # Development with auto-reload
npm run build    # Compile TypeScript
npm start        # Production server
```

## Testing

Test the webhook endpoint:

```bash
curl http://localhost:3001/health
```

## Production Deployment

1. Deploy the main app to Vercel/Netlify
2. Deploy the webhook service to Railway/Render/Heroku
3. Update Stripe webhook endpoint to your production webhook service URL
4. Update environment variables in both deployments

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC
