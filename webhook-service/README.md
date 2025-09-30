# Webhook Service

This is a dedicated Express server that handles Stripe webhook events and updates the Supabase database.

## Features

- Express.js server
- Stripe webhook event handling
- Supabase database updates
- TypeScript support
- Automatic subscription management

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

4. The service will be available at [http://localhost:3001](http://localhost:3001)

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret
- `PORT`: Port to run the server on (default: 3001)

## Webhook Endpoint

The webhook endpoint is available at: `http://localhost:3001/webhook`

### Setting up Stripe Webhooks

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Other platforms: https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3001/webhook
   ```

4. The CLI will display your webhook signing secret. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

### For Production

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/webhook`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
5. Copy the webhook signing secret to your `.env` file

## Handled Events

- `customer.subscription.created` - Creates a new subscription in Supabase
- `customer.subscription.updated` - Updates subscription status and details
- `customer.subscription.deleted` - Marks subscription as canceled
- `checkout.session.completed` - Logs checkout completion

## Database Updates

The service automatically updates the following Supabase tables:

### subscriptions
- `stripe_subscription_id` - Stripe subscription ID
- `customer_id` - Reference to customer in Supabase
- `status` - Subscription status (active, canceled, etc.)
- `price_id` - Stripe price ID
- `current_period_start` - Start of current billing period
- `current_period_end` - End of current billing period
- `updated_at` - Last update timestamp

## Health Check

Check if the service is running:
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "service": "webhook-service"
}
```

## Development

Build the TypeScript code:
```bash
npm run build
```

Run the production build:
```bash
npm start
```

## Architecture

This webhook service is designed to be separate from the main application to:
- Handle webhook events reliably
- Scale independently
- Isolate webhook processing logic
- Provide better security (doesn't expose webhook secret to frontend)
- Allow for easier monitoring and debugging of webhook events

## Notes

- This service works in conjunction with the main app (see `/main-app`)
- Ensure the database schema is set up in Supabase (see main app README)
- Keep the webhook secret secure and never commit it to version control
