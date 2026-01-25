import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tesseric - Architecture, piece by piece',
  description: 'AI-powered AWS architecture review service. Get instant, Well-Architected-aligned feedback on your cloud designs in seconds.',
  keywords: ['AWS', 'architecture', 'review', 'well-architected', 'cloud', 'AI', 'Bedrock'],
  authors: [{ name: 'Arsh Singh' }],
  metadataBase: new URL('https://tesseric.ca'),
  openGraph: {
    title: 'Tesseric - AI-Powered AWS Architecture Review',
    description: 'Get instant, expert feedback on your AWS architectures aligned with the Well-Architected Framework',
    type: 'website',
    url: 'https://tesseric.ca',
    siteName: 'Tesseric',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tesseric - Architecture, piece by piece',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tesseric - AI-Powered AWS Architecture Review',
    description: 'Get instant, expert feedback on your AWS architectures',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon.ico' },
    ],
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
