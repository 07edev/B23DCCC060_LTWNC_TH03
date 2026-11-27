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

const statusText = (p: Post): string => (p.resolved ? 'Đã nhận lại' : STATUS_LABEL[p.status]);

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
      <h1>Tin đăng của tôi</h1>

      <PostForm action={createPostAction} />

      <form method="GET" action="/my-posts" className="inline">
        <div>
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

      <p>
        Hiển thị {items.length} / {total} tin
      </p>

      {items.length > 0 && (
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
                <td>{statusText(p)}</td>
                <td>
                  {p.status === 'approved' && !p.resolved && (
                    <form action={resolvePostAction.bind(null, p.id)}>
                      <button type="submit">Đánh dấu đã nhận lại</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p>
        {nextCursor !== null ? (
          <Link href={`/my-posts?${moreParams.toString()}`}>Xem thêm</Link>
        ) : (
          'Đã hiển thị hết tin'
        )}
      </p>
    </section>
  );
}
