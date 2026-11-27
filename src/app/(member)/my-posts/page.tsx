import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import PostForm from '@/components/PostForm';
import { formatDate } from '@/lib/format';
import { listMine, parseStatus } from '@/lib/my-posts';
import { firstParam } from '@/lib/posts';
import type { Post, PostStatus } from '@/types';
import { createPostAction, resolvePostAction } from './actions';
import Icon from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Tin đăng của tôi',
  robots: { index: false },
};

const PAGE_SIZE = 8;

const STATUS_LABEL: Record<PostStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đang hiển thị',
  hidden: 'Đã ẩn',
};

function StatusBadge({ post }: { post: Post }) {
  if (post.resolved) return <span className="badge badge-resolved">Đã nhận lại</span>;
  return <span className={`badge badge-${post.status}`}>{STATUS_LABEL[post.status]}</span>;
}

const parseLimit = (v: string): number => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : PAGE_SIZE;
};

interface MyPostsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// SSR: trạng thái lọc và số tin hiển thị nằm trên URL.
export default async function MyPostsPage({ searchParams }: MyPostsPageProps) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect('/login?callbackUrl=%2Fmy-posts');

  const sp = await searchParams;
  const status = parseStatus(firstParam(sp.status));
  const limit = parseLimit(firstParam(sp.limit));

  const { items, nextCursor, total } = listMine(email, status, 0, limit);

  const moreParams = new URLSearchParams();
  if (status) moreParams.set('status', status);
  moreParams.set('limit', String(limit + PAGE_SIZE));

  return (
    <section>
      <div className="page-head">
        <h1>Tin đăng của tôi</h1>
        <p>Đăng tin mới và theo dõi trạng thái các tin bạn đã đăng.</p>
      </div>

      <PostForm action={createPostAction} />

      <div className="card">
        <div className="card-title">
          <h2>
            <Icon name="list" /> Danh sách tin
          </h2>
          <form method="GET" action="/my-posts" className="filter-bar compact">
            <div className="field">
              <label htmlFor="status">Trạng thái</label>
              <select id="status" name="status" defaultValue={status}>
                <option value="">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đang hiển thị</option>
                <option value="hidden">Đã ẩn</option>
              </select>
            </div>
            <button type="submit">Lọc</button>
          </form>
        </div>

        <p className="count">
          Hiển thị {items.length} / {total} tin
        </p>

        {items.length === 0 ? (
          <div className="empty">
            <p>Chưa có tin nào.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{formatDate(p.date)}</td>
                    <td>
                      <StatusBadge post={p} />
                    </td>
                    <td>
                      {p.status === 'approved' && !p.resolved ? (
                        <form action={resolvePostAction.bind(null, p.id)}>
                          <button type="submit" className="btn-outline btn-sm">
                            Đánh dấu đã nhận lại
                          </button>
                        </form>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="load-more">
          {nextCursor !== null ? (
            <Link href={`/my-posts?${moreParams.toString()}`} className="btn btn-outline">
              Xem thêm
            </Link>
          ) : (
            <span className="muted">Đã hiển thị hết tin</span>
          )}
        </div>
      </div>
    </section>
  );
}
