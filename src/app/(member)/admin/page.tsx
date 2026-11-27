import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { formatDate } from '@/lib/format';
import { can } from '@/lib/permissions';
import { getPendingPosts, getPostStats } from '@/lib/posts';
import { moderatePost } from './actions';

export const metadata: Metadata = {
  title: 'Kiểm duyệt tin đăng',
  robots: { index: false },
};

export default async function AdminPage() {
  // Lớp bảo vệ thứ 2 (sau proxy): kiểm tra lại quyền ngay trong trang.
  const session = await auth();
  if (!can(session?.user?.role, 'post:moderate')) redirect('/forbidden');

  const stats = getPostStats();
  const pending = getPendingPosts();

  return (
    <section>
      <h1>Kiểm duyệt tin đăng</h1>
      <p>
        Chờ duyệt: {stats.pending} | Đang hiển thị: {stats.approved} | Đã ẩn:{' '}
        {stats.hidden}
      </p>

      {pending.length === 0 ? (
        <p>Không có tin nào chờ duyệt.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Ngày</th>
              <th>Người đăng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{formatDate(p.date)}</td>
                <td>{p.authorEmail}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <form action={moderatePost.bind(null, p.id, 'approved')}>
                      <button type="submit">Duyệt</button>
                    </form>
                    <form action={moderatePost.bind(null, p.id, 'hidden')}>
                      <button type="submit">Ẩn</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
