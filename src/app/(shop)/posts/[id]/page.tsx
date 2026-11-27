import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatDate, formatTime } from '@/lib/format';
import { getPublicPost, getPublicPosts, SITE_URL } from '@/lib/posts';

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
      <h1>{post.title}</h1>
      <ul>
        <li>Loại tin: {post.kind}</li>
        <li>Danh mục: {post.category}</li>
        <li>Địa điểm: {post.place}</li>
        <li>Ngày: {formatDate(post.date)}</li>
        <li>Người đăng: {post.authorEmail}</li>
      </ul>
      <p style={{ whiteSpace: 'pre-line' }}>{post.description}</p>
      <p className="muted">Cập nhật lúc: {formatTime(new Date())}</p>
    </article>
  );
}
