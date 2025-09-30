'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_example', // Replace with your actual Stripe price ID
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div style={{ padding: '50px' }}>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <button
          onClick={() => signOut()}
          style={{
            padding: '10px 20px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <p>Welcome, {session.user?.email}!</p>
      </div>

      <div style={{ 
        border: '1px solid #ddd', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Subscription</h2>
        <p>Manage your subscription and billing information.</p>
        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px' 
      }}>
        <h3>How it works</h3>
        <ul>
          <li>Click "Subscribe Now" to create a Stripe checkout session</li>
          <li>Complete the payment on Stripe's secure checkout page</li>
          <li>Stripe webhooks are handled by the separate webhook service</li>
          <li>Your subscription status is updated in Supabase automatically</li>
        </ul>
      </div>
    </div>
  )
}
