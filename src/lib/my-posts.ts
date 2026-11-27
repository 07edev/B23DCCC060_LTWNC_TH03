import { db } from './db';
import { isCategory, isKind, isPlace } from './post-validate';
import type { PostInput } from './post-validate';
import type { Post, PostStatus } from '../types';

export interface MyPostsPage {
  items: Post[];
  nextCursor: number | null;
  total: number;
}

export type ResolveResult = 'ok' | 'not-found' | 'forbidden' | 'not-approved';

/** Chỉ nhận pending / approved / hidden; giá trị khác coi như không lọc (''). */
export function parseStatus(v: unknown): PostStatus | '' {
  return v === 'pending' || v === 'approved' || v === 'hidden' ? v : '';
}

/** Tin của chính người dùng, phân trang theo cursor (vị trí bắt đầu). */
export function listMine(
  email: string,
  status: PostStatus | '',
  cursor = 0,
  size = 8,
): MyPostsPage {
  const all = db.posts.filter(
    (p) => p.authorEmail === email && (status === '' || p.status === status),
  );
  const end = cursor + size;
  return {
    items: all.slice(cursor, end),
    nextCursor: end < all.length ? end : null,
    total: all.length,
  };
}

/** Tạo tin mới trạng thái pending, thêm vào đầu danh sách. Input phải đã qua validatePost. */
export function submitPost(email: string, input: PostInput): Post {
  const { kind, category, place } = input;
  if (!isKind(kind) || !isCategory(category) || !isPlace(place)) {
    throw new Error('Dữ liệu tin đăng không hợp lệ');
  }
  const post: Post = {
    id: db.nextPostId++,
    title: input.title.trim(),
    kind,
    category,
    place,
    date: input.date,
    description: `${input.description.trim()}\nLiên hệ: ${input.contactType} ${input.contact.trim()}`,
    authorEmail: email,
    status: 'pending',
    resolved: false,
  };
  db.posts.unshift(post);
  return post;
}

/** Người đăng đánh dấu tin đã nhận lại. */
export function resolvePost(email: string, id: number): ResolveResult {
  const post = db.posts.find((p) => p.id === id);
  if (!post) return 'not-found';
  if (post.authorEmail !== email) return 'forbidden';
  if (post.status !== 'approved') return 'not-approved';
  post.resolved = true;
  return 'ok';
}
