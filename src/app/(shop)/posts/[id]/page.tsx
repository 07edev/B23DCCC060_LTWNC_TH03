import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import KindBadge from '@/components/KindBadge';
import { formatDate } from '@/lib/format';
import { formatTime } from '@/lib/time';
import { getPublicPost, getPublicPosts, SITE_URL } from '@/lib/posts';
import Icon from '@/components/Icon';

// ISR: trang tĩnh được làm mới tối đa 30 giây/lần.
export const revalidate = 30;

interface DetailProps {
  params: Promise<{ id: string }>;
}

// SSG: chỉ sinh sẵn 10 tin công khai đầu tiên, các tin khác render khi có request.
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const posts = await getPublicPosts();
  return posts.slice(0, 10).map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublicPost(Number(id));
  if (!post) return { title: 'Không tìm thấy tin đăng' };

  const title = `${post.title} – ${post.place}`;
  return {
    title,
    description: post.description,
    openGraph: {
      title,
      description: post.description,
      type: 'article',
      url: `${SITE_URL}/posts/${post.id}`,
    },
  };
}

export default async function PostDetailPage({ params }: DetailProps) {
  const { id } = await params;
  const post = await getPublicPost(Number(id));
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Tin đăng', item: `${SITE_URL}/posts` },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/posts/${post.id}`,
      },
    ],
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span>›</span>
        <Link href="/posts">Tin đăng</Link>
        <span>›</span>
        <span>{post.title}</span>
      </nav>

      <div className="card">
        <div className="detail-head">
          <KindBadge kind={post.kind} />
          <span className="badge">{post.category}</span>
        </div>
        <h1>{post.title}</h1>
        <ul className="info-grid">
          <li>
            <Icon name="tag" /> Loại tin: {post.kind}
          </li>
          <li>
            <Icon name="folder" /> Danh mục: {post.category}
          </li>
          <li>
            <Icon name="pin" /> Địa điểm: {post.place}
          </li>
          <li>
            <Icon name="calendar" /> Ngày: {formatDate(post.date)}
          </li>
          <li>
            <Icon name="user" /> Người đăng: {post.authorEmail}
          </li>
        </ul>
        <h2>Mô tả</h2>
        <p className="description">{post.description}</p>
        <div className="meta-row">
          <Link href="/posts" className="btn btn-outline btn-sm">
            <Icon name="arrow-left" size={14} /> Quay lại danh sách
          </Link>
          <p className="muted small">Cập nhật lúc: {formatTime(new Date())}</p>
        </div>
      </div>
    </article>
  );
}
