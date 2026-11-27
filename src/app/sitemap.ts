import type { MetadataRoute } from 'next';
import { getPublicPosts, SITE_URL } from '@/lib/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublicPosts();
  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/posts` },
    ...posts.map((p) => ({ url: `${SITE_URL}/posts/${p.id}` })),
  ];
}
