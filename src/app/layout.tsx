import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'BillNegotiate AI - Reduce Your Medical Bills',
  description: 'AI-powered chat service to help you negotiate and reduce your medical bills',
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
            <div className="flex flex-col h-screen overflow-hidden">
              <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
