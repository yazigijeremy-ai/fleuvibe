import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'FleuVibe — Discover River Routes & Book Water Experiences',
  description:
    'FleuVibe helps outdoor enthusiasts discover curated river routes, check real-time conditions, and book experiences with local guides — all in one place.',
  keywords: ['kayak', 'river routes', 'paddle', 'water sports', 'outdoor activities', 'booking'],
  openGraph: {
    title: 'FleuVibe — River Routes, Real Conditions, Instant Booking',
    description: 'Discover your next river adventure with FleuVibe.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FleuVibe — River Routes & Water Experiences',
    description: 'Discover, plan, and book your next river adventure.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
