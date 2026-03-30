import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Permit Portal - Southern Cities Construction',
  description: 'Manage your construction permits online with Southern Cities',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#f8f9fc] min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
