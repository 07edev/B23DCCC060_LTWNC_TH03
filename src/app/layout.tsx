import type { Metadata } from 'next';
import Header from '@/components/Header';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PTIT Found',
    template: '%s | PTIT Found',
  },
  description: 'Tìm đồ thất lạc trong trường PTIT',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <Header />
          <main className="container">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
