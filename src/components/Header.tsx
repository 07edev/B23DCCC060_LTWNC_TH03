import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <nav className="container nav">
        <Link href="/">Trang chủ</Link>
        <Link href="/posts">Tin đăng</Link>
      </nav>
    </header>
  );
}
