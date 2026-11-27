'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Icon from './Icon';

interface NavItem {
  href: string;
  label: string;
}

export default function Header() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();

  // Đăng nhập bằng Server Action không tải lại trang, nên đọc lại phiên khi đổi trang.
  useEffect(() => {
    void update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const user = session?.user;

  const items: NavItem[] = [
    { href: '/', label: 'Trang chủ' },
    { href: '/posts', label: 'Tin đăng' },
  ];
  if (user) items.push({ href: '/my-posts', label: 'Tin của tôi' });
  if (user?.role === 'admin') items.push({ href: '/admin', label: 'Quản trị' });

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="header">
      <nav className="container nav">
        <Link href="/" className="brand" aria-label="PTIT Found – Trang chủ">
          <span className="brand-logo" aria-hidden="true">
            <Icon name="search" size={18} />
          </span>
          PTIT <span>Found</span>
        </Link>

        <div className="nav-links">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${isActive(item.href) ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <span className="spacer" />

        {user ? (
          <div className="user-box">
            <span className="avatar" aria-hidden="true">
              {user.name?.split(' ').pop()?.charAt(0) ?? '?'}
            </span>
            <span className="greeting">
              Xin chào, {user.name} ({user.role})
            </span>
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => signOut({ redirectTo: '/' })}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          status !== 'loading' && (
            <div className="user-box">
              <Link href="/login" className="btn btn-sm">
                Đăng nhập
              </Link>
            </div>
          )
        )}
      </nav>
    </header>
  );
}
