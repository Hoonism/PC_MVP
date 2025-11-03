import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { Navbar } from '@/components/Navbar'
import { NotificationToast } from '@/components/NotificationToast'

export const metadata: Metadata = {
  title: 'BillReduce AI - Medical Bill Negotiation & Pregnancy Storybook',
  description: 'AI-powered platform helping you negotiate medical bills and create beautiful pregnancy journey storybooks. Get professional negotiation assistance and preserve precious memories.',
  keywords: ['medical bills', 'bill negotiation', 'healthcare costs', 'pregnancy storybook', 'AI assistant', 'medical expenses'],
  authors: [{ name: 'BillReduce AI' }],
  creator: 'BillReduce AI',
  publisher: 'BillReduce AI',
  openGraph: {
    title: 'BillReduce AI - Medical Bill Negotiation & Pregnancy Storybook',
    description: 'AI-powered platform helping you negotiate medical bills and create beautiful pregnancy journey storybooks.',
    url: 'https://billreduce.ai',
    siteName: 'BillReduce AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BillReduce AI - Medical Bill Negotiation & Pregnancy Storybook',
    description: 'AI-powered platform helping you negotiate medical bills and create beautiful pregnancy journey storybooks.',
    creator: '@billreduce',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="flex flex-col h-screen">
              <Navbar />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
            <NotificationToast />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
