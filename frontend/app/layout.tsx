import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Tesseric - AI-Powered AWS Architecture Review',
    template: '%s | Tesseric'
  },
  description: 'AI-powered AWS architecture review service. Get instant, Well-Architected-aligned feedback on your cloud designs in seconds. Powered by Amazon Bedrock and Claude 3.5 Haiku. ~$0.01 per review, no signup required.',
  keywords: [
    'AWS architecture review',
    'Well-Architected Framework',
    'AWS best practices',
    'cloud architecture review',
    'AWS Bedrock',
    'Claude AI',
    'AWS solutions architect',
    'infrastructure review',
    'AWS security audit',
    'cloud cost optimization',
    'AWS reliability',
    'architecture assessment'
  ],
  authors: [{ name: 'Arsh Singh', url: 'https://iamarsh.com' }],
  creator: 'Arsh Singh',
  publisher: 'Tesseric',
  metadataBase: new URL('https://tesseric.ca'),
  alternates: {
    canonical: 'https://tesseric.ca'
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
  openGraph: {
    title: 'Tesseric - AI-Powered AWS Architecture Review',
    description: 'Get instant, expert feedback on your AWS architectures aligned with the Well-Architected Framework. Powered by Amazon Bedrock. ~$0.01 per review, no signup required.',
    type: 'website',
    locale: 'en_US',
    url: 'https://tesseric.ca',
    siteName: 'Tesseric',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tesseric - Architecture, piece by piece',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tesseric - AI-Powered AWS Architecture Review',
    description: 'Get instant, expert feedback on your AWS architectures aligned with the Well-Architected Framework',
    images: ['/og-image.png'],
    creator: '@iamarsh',
    site: '@tesseric'
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
  manifest: '/site.webmanifest',
  category: 'technology',
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
