import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'โคมล้านนาพับเก็บได้ | Foldable Lanna Lantern',
  description:
    'การสร้างแบบจำลองเชิงคณิตศาสตร์ของโคมล้านนาแบบพับเก็บได้จากกระดาษใยสับปะรด',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}