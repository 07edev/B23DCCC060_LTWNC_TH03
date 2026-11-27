import Link from 'next/link';
import { getPublicPosts } from '@/lib/posts';

// SSG: trang được sinh sẵn khi build, làm mới bằng revalidatePath khi dữ liệu đổi.
export default async function HomePage() {
  const posts = await getPublicPosts();

  return (
    <section>
      <h1>PTIT Found – Tìm đồ thất lạc</h1>
      <p>{posts.length} tin đang hiển thị</p>
      <Link href="/posts">Xem tất cả tin</Link>
    </section>
  );
}
