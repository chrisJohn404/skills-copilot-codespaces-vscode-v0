import express, { Request, Response } from 'express'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'webhook-service' })
})

// Stripe webhook endpoint
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    console.log(`Received event: ${event.type}`)

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break

        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      res.json({ received: true })
    } catch (error: any) {
      console.error(`Error processing webhook: ${error.message}`)
      res.status(500).json({ error: 'Webhook processing failed' })
    }
  }
)

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Handling subscription update:', subscription.id)

  // Get customer email
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  const customerEmail = (customer as Stripe.Customer).email

  if (!customerEmail) {
    console.error('Customer email not found')
    return
  }

  // Get customer from database
  const { data: customerData } = await supabase
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single()

  if (!customerData) {
    console.error('Customer not found in database')
    return
  }

  // Upsert subscription
  const subscriptionData = {
    customer_id: customerData.id,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    current_period_start: (subscription as any).current_period_start 
      ? new Date((subscription as any).current_period_start * 1000).toISOString()
      : null,
    current_period_end: (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }

  console.log('Subscription updated successfully')
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Handling subscription deletion:', subscription.id)

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }

  console.log('Subscription marked as canceled')
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Handling checkout completion:', session.id)

  // The subscription is already created and will be handled by subscription.created event
  // This is just for logging and additional processing if needed
  console.log('Checkout session completed for customer:', session.customer)
}

app.listen(PORT, () => {
  console.log(`Webhook service listening on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`)
})
