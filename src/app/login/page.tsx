import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { firstParam } from '@/lib/posts';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Đăng nhập' };

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) redirect('/');

  const sp = await searchParams;
  const callbackUrl = firstParam(sp.callbackUrl) || '/my-posts';

  return (
    <section>
      <h1>Đăng nhập</h1>
      <LoginForm callbackUrl={callbackUrl} />
    </section>
  );
}
