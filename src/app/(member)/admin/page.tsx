import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import KindBadge from '@/components/KindBadge';
import { formatDate } from '@/lib/format';
import { can } from '@/lib/permissions';
import { getPendingPosts, getPostStats } from '@/lib/posts';
import { moderatePost } from './actions';
import Icon from '@/components/Icon';

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
      <div className="page-head">
        <h1>Kiểm duyệt tin đăng</h1>
        <p>Duyệt để tin hiển thị công khai, hoặc ẩn tin không phù hợp.</p>
      </div>

      <p className="stats">
        <span className="s-pending">
          Chờ duyệt: <b>{stats.pending}</b>
        </span>{' '}
        |{' '}
        <span className="s-approved">
          Đang hiển thị: <b>{stats.approved}</b>
        </span>{' '}
        |{' '}
        <span className="s-hidden">
          Đã ẩn: <b>{stats.hidden}</b>
        </span>
      </p>

      {pending.length === 0 ? (
        <div className="empty">
          <Icon name="inbox" size={28} />
          <p>Không có tin nào chờ duyệt.</p>
        </div>
      ) : (
        <div className="table-wrap">
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
                  <td>
                    <div>{p.title}</div>
                    <KindBadge kind={p.kind} />
                  </td>
                  <td>{formatDate(p.date)}</td>
                  <td>{p.authorEmail}</td>
                  <td>
                    <div className="row-actions">
                      <form action={moderatePost.bind(null, p.id, 'approved')}>
                        <button type="submit" className="btn-success btn-sm">
                          Duyệt
                        </button>
                      </form>
                      <form action={moderatePost.bind(null, p.id, 'hidden')}>
                        <button type="submit" className="btn-muted btn-sm">
                          Ẩn
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
