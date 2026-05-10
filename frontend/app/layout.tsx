import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Trace', template: '%s | Trace' },
  description: 'Trace — Financial infrastructure for informal African trade. Collect payments, build credit, hire workers, unlock capital.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ backgroundColor: '#fff8f6' }}>
        {children}
      </body>
    </html>
  )
}
