import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome to SaaS Starter Kit</h1>
      <p>
        This is a two-part application demonstrating a Next.js + Auth.js + Supabase + Stripe integration.
      </p>
      
      <h2>Features</h2>
      <ul>
        <li>User authentication with Auth.js and Supabase</li>
        <li>Stripe subscription management</li>
        <li>Separate webhook service for handling Stripe events</li>
        <li>Real-time database updates</li>
      </ul>

      <div style={{ marginTop: '30px' }}>
        <Link href="/login" style={{ 
          padding: '10px 20px', 
          background: '#0070f3', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px',
          marginRight: '10px'
        }}>
          Sign In
        </Link>
        <Link href="/dashboard" style={{ 
          padding: '10px 20px', 
          background: '#24292e', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Dashboard
        </Link>
      </div>

      <h2 style={{ marginTop: '50px' }}>Architecture</h2>
      <p>
        This application consists of two parts:
      </p>
      <ul>
        <li><strong>Main App (Port 3000):</strong> Next.js application with authentication and checkout</li>
        <li><strong>Webhook Service (Port 3001):</strong> Express server handling Stripe webhooks</li>
      </ul>
    </div>
  )
}
