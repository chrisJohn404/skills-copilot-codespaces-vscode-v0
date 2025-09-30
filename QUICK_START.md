# Quick Setup Guide

This guide will help you get both applications running in under 10 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Stripe account created
- [ ] Git installed

## Step-by-Step Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd skills-copilot-codespaces-vscode-v0
```

### 2. Set Up Supabase (5 minutes)

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and wait for provisioning

#### Create Database Tables
1. Go to SQL Editor in Supabase dashboard
2. Run this SQL:

```sql
-- Create customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
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

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_customers_stripe_id ON customers(stripe_customer_id);
```

#### Get Supabase Credentials
1. Go to Project Settings → API
2. Copy these values:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

### 3. Set Up Stripe (5 minutes)

#### Get Stripe Keys
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Switch to "Test mode" (toggle in top right)
3. Go to Developers → API keys
4. Copy:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

#### Create a Product and Price
1. Go to Products → Add product
2. Name: "Pro Subscription" (or whatever you like)
3. Price: $10/month (or your preferred amount)
4. Click "Save product"
5. Copy the Price ID (starts with `price_`)

### 4. Configure Main Application

```bash
cd main-app
cp .env.example .env
```

Edit `.env` with your credentials:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Install dependencies and start:
```bash
npm install
npm run dev
```

✅ Main app running at http://localhost:3000

### 5. Configure Webhook Service

Open a new terminal:
```bash
cd webhook-service
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (we'll get this in next step)
PORT=3001
```

Install dependencies:
```bash
npm install
```

### 6. Set Up Stripe Webhooks (Local Testing)

#### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop install stripe

# Or download from: https://github.com/stripe/stripe-cli/releases
```

#### Login to Stripe
```bash
stripe login
```

#### Start Webhook Forwarding
```bash
stripe listen --forward-to localhost:3001/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

Copy this secret and add it to both `.env` files as `STRIPE_WEBHOOK_SECRET`.

#### Start Webhook Service
In another terminal:
```bash
cd webhook-service
npm run dev
```

✅ Webhook service running at http://localhost:3001

### 7. Test the Application

#### Create a Test User in Supabase
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Click "Create user"

#### Test the Flow
1. Go to http://localhost:3000
2. Click "Sign In"
3. Login with the test user credentials
4. Click "Dashboard"
5. Click "Subscribe Now"
6. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
7. Complete the checkout

#### Verify It Worked
- Check the Stripe CLI terminal - you should see webhook events
- Check the webhook service terminal - you should see processing logs
- Check Supabase dashboard → Table Editor → subscriptions - you should see the new subscription

🎉 **Success!** Your two-part SaaS application is working!

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Webhook Not Receiving Events
1. Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3001/webhook`
2. Check webhook service is running on port 3001
3. Verify `STRIPE_WEBHOOK_SECRET` matches in both `.env` files

### Authentication Not Working
1. Verify Supabase credentials are correct
2. Check that user exists in Supabase Authentication
3. Ensure `NEXTAUTH_SECRET` is set in main app `.env`

### Checkout Not Working
1. Verify Stripe keys are correct (use test keys)
2. Update `priceId` in `main-app/app/dashboard/page.tsx` to your actual Stripe price ID
3. Check browser console for errors

## Next Steps

### For Production Deployment

1. **Deploy Main App to Vercel**
   ```bash
   cd main-app
   vercel
   ```

2. **Deploy Webhook Service to Railway**
   ```bash
   cd webhook-service
   # Follow Railway deployment guide
   ```

3. **Update Stripe Webhook Endpoint**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-webhook-service.com/webhook`
   - Select events to listen to
   - Copy webhook secret to production environment

4. **Update Environment Variables**
   - Set production environment variables in Vercel and Railway
   - Use production Stripe keys
   - Update `NEXTAUTH_URL` to your production domain

### Customize the Application

1. **Update Branding**
   - Edit `main-app/app/page.tsx` for home page
   - Add your logo and colors in `globals.css`

2. **Add More Features**
   - Email notifications
   - Customer portal
   - Usage tracking
   - Analytics

3. **Add Tests**
   - Unit tests with Jest
   - E2E tests with Playwright
   - Integration tests

## Support

If you encounter issues:
1. Check the terminal logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all services are running
4. Check the documentation in individual README files

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
