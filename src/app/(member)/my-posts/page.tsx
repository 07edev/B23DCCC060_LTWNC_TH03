import type { Metadata } from 'next';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Tin đăng của tôi',
  robots: { index: false },
};

export default async function MyPostsPage() {
  const session = await auth();

  return (
    <section>
      <h1>Tin đăng của tôi</h1>
      <p className="muted">Tài khoản: {session?.user?.email}</p>
    </section>
  );
}
