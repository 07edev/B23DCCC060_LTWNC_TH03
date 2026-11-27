import type { Metadata } from 'next';
import Link from 'next/link';
import KindBadge from '@/components/KindBadge';
import { KINDS } from '@/data/posts';
import { formatDate } from '@/lib/format';
import { formatTime } from '@/lib/time';
import { firstParam, getPublicPosts, parseKind, parseSort } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Tin đăng',
  description: 'Danh sách tin thất lạc và nhặt được đang hiển thị',
};

interface PostsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// SSR: đọc searchParams nên trang được render lại ở mỗi request.
export default async function PostsPage({ searchParams }: PostsPageProps) {
  const sp = await searchParams;
  const q = firstParam(sp.q);
  const kind = parseKind(sp.kind);
  const sort = parseSort(sp.sort);

  const posts = await getPublicPosts({ q, kind, sort });
  const filtered = q !== '' || kind !== undefined || sort !== undefined;

  return (
    <section>
      <div className="page-head">
        <h1>Tin đang hiển thị</h1>
        <p>Tìm kiếm, lọc theo loại tin và sắp xếp theo ngày.</p>
      </div>

      <form method="GET" action="/posts" className="card filter-bar">
        <div className="field grow">
          <label htmlFor="q">Tìm kiếm</label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="VD: thẻ sinh viên, điện thoại…"
            defaultValue={q}
          />
        </div>
        <div className="field">
          <label htmlFor="kind">Loại tin</label>
          <select id="kind" name="kind" defaultValue={kind ?? ''}>
            <option value="">Tất cả</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sắp xếp</label>
          <select id="sort" name="sort" defaultValue={sort ?? ''}>
            <option value="">Mặc định</option>
            <option value="date-desc">Mới nhất</option>
            <option value="date-asc">Cũ nhất</option>
          </select>
        </div>
        <button type="submit">Lọc</button>
        {filtered && (
          <Link href="/posts" className="btn btn-muted">
            Xóa lọc
          </Link>
        )}
      </form>

      <div className="meta-row">
        <p className="count">Có {posts.length} tin đang hiển thị</p>
        <p className="muted small">Render lúc: {formatTime(new Date())}</p>
      </div>

      {posts.length === 0 ? (
        <div className="empty">
          <p>Không có tin nào phù hợp</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Loại tin</th>
                <th>Địa điểm</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/posts/${p.id}`}>{p.title}</Link>
                  </td>
                  <td>
                    <KindBadge kind={p.kind} />
                  </td>
                  <td>{p.place}</td>
                  <td>{formatDate(p.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
