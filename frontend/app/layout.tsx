import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: { default: 'Trace', template: '%s | Trace' },
  description: 'Trace — Financial infrastructure for informal African trade. Collect payments, build credit, hire workers, unlock capital.',
  icons: {
    icon: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' rx='10' fill='%23141420'/%3E%3Crect x='7' y='9' width='26' height='5' rx='2.5' fill='%23FF6B35'/%3E%3ClinearGradient id='g' x1='20' y1='14' x2='20' y2='31' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0%25' stop-color='%23FF6B35'/%3E%3Cstop offset='100%25' stop-color='%23F5A623'/%3E%3C/linearGradient%3E%3Crect x='17' y='14' width='6' height='17' rx='2' fill='url(%23g)'/%3E%3Ccircle cx='29' cy='29' r='3' fill='%23FF6B35' opacity='0.7'/%3E%3C/svg%3E",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ backgroundColor: "#0d0d0d", color: "#f0f0f0" }}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
