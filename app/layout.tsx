import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Medical News Agent',
  description:
    'AI-powered medical news aggregator — WHO, CDC, NIH, PubMed, MedicalXpress, Google News Health, Reuters Health',
  keywords: ['medical news', 'health', 'WHO', 'CDC', 'NIH', 'PubMed', 'disease'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
