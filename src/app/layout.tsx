import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'โคมล้านนาพับเก็บได้ | คณิตศาสตร์',
  description: 'แบบจำลองคณิตศาสตร์โคมล้านนาพับเก็บได้จากกระดาษใยสับปะรด ด้วยเรขาคณิตและตรีโกณมิติ',
  keywords: ['โคมล้านนา', 'คณิตศาสตร์', 'กระดาษใยสับปะรด', 'เชียงราย'],
  openGraph: {
    title: 'โคมล้านนาพับเก็บได้',
    description: 'แบบจำลองเชิงคณิตศาสตร์โคมล้านนา',
    url: 'https://proj-math-repo.vercel.app/',
  },
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