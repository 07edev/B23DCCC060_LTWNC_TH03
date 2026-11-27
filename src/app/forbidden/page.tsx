import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';

export const metadata: Metadata = { title: 'Không có quyền' };

export default function ForbiddenPage() {
  return (
    <div className="center-page">
      <section className="card state-page">
        <div className="state-icon">
          <Icon name="ban" size={28} />
        </div>
        <h1>Bạn không có quyền truy cập trang này</h1>
        <p>Trang này chỉ dành cho quản trị viên. Hãy quay lại trang chủ.</p>
        <Link href="/" className="btn">
          Về trang chủ
        </Link>
      </section>
    </div>
  );
}
