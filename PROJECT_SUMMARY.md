# Project Summary

## Two-Part SaaS Application Architecture

This project implements a modern SaaS starter kit with separated concerns for better scalability, security, and maintainability.

### Application Components

#### 1. Main Application (`/main-app`)
- **Framework**: Next.js 15 with App Router
- **Port**: 3000
- **Purpose**: User-facing application

**Key Features:**
- User authentication via Auth.js (NextAuth.js)
- Protected routes and dashboard
- Stripe checkout integration
- Supabase database integration
- TypeScript support

**Pages:**
- `/` - Home page with feature overview
- `/login` - User authentication page
- `/dashboard` - Protected user dashboard with subscription management

**API Routes:**
- `/api/auth/[...nextauth]` - NextAuth.js authentication handler
- `/api/create-checkout` - Creates Stripe checkout sessions

#### 2. Webhook Service (`/webhook-service`)
- **Framework**: Express.js
- **Port**: 3001
- **Purpose**: Handle Stripe webhook events

**Key Features:**
- Secure webhook signature verification
- Automatic Supabase database updates
- Event-driven subscription management
- TypeScript support

**Endpoints:**
- `GET /health` - Health check endpoint
- `POST /webhook` - Stripe webhook handler

**Handled Events:**
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Cancellations
- `checkout.session.completed` - Successful checkout

### Architecture Benefits

1. **Separation of Concerns**
   - Main app handles user interactions
   - Webhook service handles payment processing
   - Clear boundaries between components

2. **Scalability**
   - Each service can be scaled independently
   - Webhook processing doesn't affect main app performance
   - Can deploy to different hosting platforms

3. **Security**
   - Webhook secrets isolated from frontend
   - Service role keys only in backend services
   - Proper authentication boundaries

4. **Maintainability**
   - Easier to debug and monitor
   - Clear code organization
   - Independent testing and deployment

### Database Schema

The application uses Supabase with two main tables:

**customers**
- `id` (UUID) - Primary key
- `email` (TEXT) - User email
- `stripe_customer_id` (TEXT) - Stripe customer ID
- `created_at` (TIMESTAMP) - Creation timestamp

**subscriptions**
- `id` (UUID) - Primary key
- `customer_id` (UUID) - Foreign key to customers
- `stripe_subscription_id` (TEXT) - Stripe subscription ID
- `status` (TEXT) - Subscription status
- `price_id` (TEXT) - Stripe price ID
- `current_period_start` (TIMESTAMP) - Billing period start
- `current_period_end` (TIMESTAMP) - Billing period end
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Data Flow

1. User signs in through Auth.js → Authenticated via Supabase
2. User clicks "Subscribe Now" → Main app creates checkout session
3. User completes payment → Stripe redirects back to app
4. Stripe sends webhook → Webhook service receives event
5. Webhook service processes event → Updates Supabase database
6. User sees updated subscription status → Data synced in real-time

### Technology Stack

**Main Application:**
- Next.js 15
- React 19
- Auth.js 4.24
- Supabase JS SDK 2.58
- Stripe SDK 18.5
- TypeScript 5.9

**Webhook Service:**
- Express.js 5
- Stripe SDK 18.5
- Supabase JS SDK 2.58
- TypeScript 5.9
- Nodemon (development)

### Environment Setup

Both applications require proper environment variables:

**Required for Main App:**
- NextAuth configuration
- Supabase URLs and keys
- Stripe keys

**Required for Webhook Service:**
- Supabase service role key
- Stripe secret and webhook secret
- Server port configuration

### Development Commands

**Main App:**
```bash
cd main-app
npm install
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Run production build
```

**Webhook Service:**
```bash
cd webhook-service
npm install
npm run dev    # Start with auto-reload
npm run build  # Compile TypeScript
npm start      # Run production build
```

### Production Deployment

**Recommended Platforms:**
- **Main App**: Vercel, Netlify, or any Next.js hosting
- **Webhook Service**: Railway, Render, Heroku, or any Node.js hosting

### Testing Strategy

1. **Build Verification**: Both applications build successfully
2. **Type Safety**: TypeScript ensures type correctness
3. **Environment Validation**: Graceful handling of missing config
4. **Webhook Testing**: Use Stripe CLI for local webhook forwarding

### Security Considerations

- Environment variables never committed to repository
- Service role keys only in backend services
- Webhook signature verification required
- JWT-based session management
- Secure authentication flow

### Future Enhancements

Potential additions:
- Customer portal for subscription management
- Email notifications
- Usage-based billing
- Team/organization support
- Analytics and reporting
- Admin dashboard

## Conclusion

This two-part architecture provides a solid foundation for building a scalable SaaS application with secure payment processing and real-time subscription management.
