import { Roboto_Mono, Press_Start_2P } from 'next/font/google'
import localFont from 'next/font/local'
import 'styles/globals.scss'
import { GoogleAnalytics } from 'lib/analytics'
import AppVisitorProvider from 'lib/AppVisitorProvider'

const roboto = Roboto_Mono({
  weight: ['700'],
  style: ['italic', 'normal'],
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})
const player2 = Press_Start_2P({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-p2',
  display: 'swap',
})
const setback = localFont({
  src: '../../public/fonts/setbackt.ttf',
  variable: '--font-setback',
  display: 'swap',
})

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${player2.variable} ${setback.variable}`}>
      <body>
        <GoogleAnalytics />
        <AppVisitorProvider>{children}</AppVisitorProvider>
      </body>
    </html>
  )
}
