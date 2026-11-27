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
          <footer className="footer">
            <div className="container">
              <span>© 2026 PTIT Found – Tìm đồ thất lạc trong trường PTIT</span>
              <span>Nhặt được đồ? Hãy đăng tin để trả lại chủ nhân.</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
