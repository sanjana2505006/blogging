import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/NavBar'

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Blog Web',
  description: 'Blog platform with role-based access and AI summaries'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <NavBar />
        <main className="main">{children}</main>
      </body>
    </html>
  )
}
