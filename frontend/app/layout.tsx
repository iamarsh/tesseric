import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Tesseric - Instant AWS Architecture Reviews',
    template: '%s | Tesseric'
  },
  description: 'Visualize your AWS architecture with interactive topology graphs. AI-powered analysis shows exactly where security risks exist. Built with Claude (AWS Bedrock), Next.js, FastAPI, and Neo4j knowledge graph. No signup required.',
  keywords: [
    'AWS architecture review',
    'architecture visualization',
    'topology mapping',
    'Neo4j knowledge graph',
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
    'architecture assessment',
    'graph database',
    'service relationships'
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
    title: 'Tesseric - Instant AWS Architecture Reviews',
    description: 'Visualize your AWS architecture with interactive topology graphs. AI-powered analysis shows exactly where security risks exist. Built with Claude, Next.js, FastAPI, and Neo4j.',
    type: 'website',
    locale: 'en_US',
    url: 'https://tesseric.ca',
    siteName: 'Tesseric',
    // TODO: Add og-image.png (1200x630px) to /public/ for social preview
    // images: [
    //   {
    //     url: '/og-image.png',
    //     width: 1200,
    //     height: 630,
    //     alt: 'Tesseric - Instant AWS Architecture Reviews',
    //     type: 'image/png',
    //   },
    // ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tesseric - Instant AWS Architecture Reviews',
    description: 'Visualize your AWS architecture with interactive topology graphs and Neo4j knowledge graph. Shows exactly where security risks exist.',
    // images: ['/og-image.png'], // TODO: Add og-image.png to /public/
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
