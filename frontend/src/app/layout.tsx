import type { Metadata } from 'next'
import '@/globals.css'

export const metadata: Metadata = {
  title: 'Feels Like Summer',
  description: 'Project to for students and teachers to connect to each other for research/projects',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
