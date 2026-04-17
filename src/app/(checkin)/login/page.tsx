'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/checkin')
      } else {
        setError('Incorrect password')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fffbf7',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          background: '#fff',
          borderRadius: '20px',
          padding: '40px 32px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          border: '1px solid #fde8d1',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '12px',
            }}
          >
            ✦ Weekly Check-In
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              color: '#111',
              marginBottom: '8px',
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Enter your password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: error ? '1.5px solid #e11d48' : '1.5px solid #e5e7eb',
              fontSize: '15px',
              outline: 'none',
              background: '#fafafa',
            }}
          />
          {error && (
            <p style={{ fontSize: '13px', color: '#e11d48', margin: '-8px 0' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              opacity: loading || !password ? 0.6 : 1,
            }}
          >
            {loading ? 'Checking\u2026' : 'Continue \u2192'}
          </button>
        </form>
      </div>
    </div>
  )
}
