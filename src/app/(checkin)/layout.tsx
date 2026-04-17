import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function CheckinRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={inter.variable}
      style={{
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        background: '#fffbf7',
        minHeight: '100vh',
        color: '#1a1a1a',
      }}
    >
      {children}
    </div>
  )
}
