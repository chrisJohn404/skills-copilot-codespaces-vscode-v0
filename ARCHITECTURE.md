# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTP/HTTPS
                                │
                    ┌───────────▼───────────┐
                    │   Main Application    │
                    │   (Next.js - :3000)   │
                    │                       │
                    │  • Home Page          │
                    │  • Login Page         │
                    │  • Dashboard          │
                    │  • Auth.js            │
                    └───────┬───────────┬───┘
                            │           │
                ┌───────────┘           └──────────┐
                │                                   │
                │ Read/Write                        │ Create Checkout
                │                                   │
    ┌───────────▼─────────────┐         ┌─────────▼──────────┐
    │      Supabase           │         │      Stripe        │
    │  • Authentication       │         │  • Checkout        │
    │  • Database             │         │  • Subscriptions   │
    │    - customers table    │         │  • Webhooks        │
    │    - subscriptions      │         └────────┬───────────┘
    └───────────┬─────────────┘                  │
                │                                 │
                │                                 │ Webhook Events
                │                                 │
                │                      ┌──────────▼──────────┐
                │                      │  Webhook Service    │
                │                      │  (Express - :3001)  │
                │                      │                     │
                │                      │  • Event Handler    │
                │                      │  • Verification     │
                │                      │  • DB Updates       │
                │                      └──────────┬──────────┘
                │                                 │
                └─────────────────────────────────┘
                         Update Database
```

## Data Flow

### User Authentication Flow
1. User visits `/login` page
2. User enters credentials
3. Auth.js validates with Supabase
4. Session created (JWT token)
5. User redirected to dashboard

### Subscription Creation Flow
1. User clicks "Subscribe Now" on dashboard
2. Main app calls `/api/create-checkout`
3. Check/create customer in Supabase
4. Create Stripe checkout session
5. User redirected to Stripe checkout
6. User completes payment
7. Stripe sends webhook to webhook service

### Webhook Processing Flow
1. Stripe sends event to webhook service
2. Service verifies webhook signature
3. Service processes event based on type:
   - `subscription.created` → Insert new subscription
   - `subscription.updated` → Update existing subscription
   - `subscription.deleted` → Mark as canceled
   - `checkout.session.completed` → Log completion
4. Service updates Supabase database
5. Changes reflected in user dashboard

## Component Responsibilities

### Main Application (Next.js)
**Responsibilities:**
- User interface and experience
- Session management
- Protected route handling
- Stripe checkout initiation
- Display subscription status

**Does NOT:**
- Process webhooks directly
- Handle payment confirmations
- Update subscription status

### Webhook Service (Express)
**Responsibilities:**
- Receive Stripe webhook events
- Verify webhook signatures
- Process subscription events
- Update database with subscription status

**Does NOT:**
- Serve user interface
- Handle user authentication
- Create checkout sessions

## Security Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                      Public Zone                             │
│  • Home page                                                 │
│  • Login page                                                │
│  • Stripe checkout page (hosted by Stripe)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Authenticated Zone                         │
│  • Dashboard (requires session)                              │
│  • API routes (session validated)                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Backend Zone                            │
│  • Webhook service (signature verified)                      │
│  • Service role database access                              │
│  • Stripe API calls                                          │
└─────────────────────────────────────────────────────────────┘
```

## Environment Separation

### Main App Environment
- `NEXTAUTH_URL` - App URL
- `NEXTAUTH_SECRET` - Session secret
- `NEXT_PUBLIC_SUPABASE_URL` - Public (client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public (client-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side only
- `STRIPE_SECRET_KEY` - Server-side only
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Public (client-side)

### Webhook Service Environment
- `SUPABASE_URL` - Backend only
- `SUPABASE_SERVICE_ROLE_KEY` - Backend only
- `STRIPE_SECRET_KEY` - Backend only
- `STRIPE_WEBHOOK_SECRET` - Backend only (never shared)
- `PORT` - Service port

## Deployment Architecture

### Development
```
localhost:3000 (Main App)
localhost:3001 (Webhook Service)
Stripe CLI (Webhook forwarding)
```

### Production
```
vercel.app (Main App)
railway.app (Webhook Service)
Stripe Webhooks (Direct to webhook service)
```

## Scalability Considerations

1. **Independent Scaling**
   - Main app scales based on user traffic
   - Webhook service scales based on payment volume

2. **Fault Isolation**
   - Main app continues if webhook service is down
   - Failed webhooks can be retried by Stripe

3. **Load Distribution**
   - User requests handled by main app
   - Payment processing handled by webhook service
   - No single point of failure

4. **Database Optimization**
   - Main app reads from database
   - Webhook service writes to database
   - Minimal lock contention

## Monitoring Points

1. **Main Application**
   - Page load times
   - Authentication success rate
   - API response times
   - Error rates

2. **Webhook Service**
   - Webhook processing time
   - Event success/failure rate
   - Database write latency
   - Queue depth (if implemented)

3. **External Services**
   - Supabase connection health
   - Stripe API response times
   - Network latency

## Future Enhancements

1. **Add Queue System**
   - Redis/Bull for webhook processing
   - Retry logic for failed events
   - Priority handling

2. **Add Monitoring**
   - Sentry for error tracking
   - DataDog for metrics
   - LogDNA for log aggregation

3. **Add Testing**
   - Unit tests for both apps
   - Integration tests
   - E2E tests with Playwright

4. **Add CI/CD**
   - GitHub Actions
   - Automated testing
   - Automated deployment
