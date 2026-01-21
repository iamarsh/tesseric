import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tesseric - Architecture, piece by piece',
  description: 'AI-powered AWS architecture review service that analyzes your designs and returns structured, Well-Architected-aligned feedback.',
  keywords: ['AWS', 'architecture', 'review', 'well-architected', 'cloud', 'AI'],
  authors: [{ name: 'Arsh Singh' }],
  openGraph: {
    title: 'Tesseric - Architecture, piece by piece',
    description: 'AI-powered AWS architecture review service',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
