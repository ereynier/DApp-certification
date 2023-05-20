import './globals.css'

export const metadata = {
  title: 'Certificates',
  description: 'Store your degree certificates on the blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='dark:bg-gray-900 text-slate-50'>{children}</body>
    </html>
  )
}
