import type { Metadata } from 'next';
import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';

interface Props {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  }, 
  description: 'The official Next.js Course Dashboard, built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        { children }
      </body>
    </html>
  );
}