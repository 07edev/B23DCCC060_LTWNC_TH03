import { db } from './db';
import { KINDS } from '../data/posts';
import type { Kind, Post, PostFilter, SortOrder } from '../types';

type ParamValue = string | string[] | undefined;

/** Lấy giá trị chuỗi đầu tiên của 1 searchParam. */
export const firstParam = (v: ParamValue): string =>
  (Array.isArray(v) ? v[0] : v) ?? '';

export const parseKind = (v: ParamValue): Kind | undefined =>
  KINDS.find((k) => k === firstParam(v));

export const parseSort = (v: ParamValue): SortOrder | undefined => {
  const s = firstParam(v);
  return s === 'date-desc' || s === 'date-asc' ? s : undefined;
};

export const SITE_URL = 'http://localhost:3000';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const isPublic = (p: Post): boolean => p.status === 'approved' && !p.resolved;

const normalize = (s: string): string => s.normalize('NFC').toLowerCase();

/** Danh sách tin công khai (approved, chưa nhận lại) theo bộ lọc. */
export async function getPublicPosts(filter: PostFilter = {}): Promise<Post[]> {
  await sleep(600); // giả lập truy vấn chậm

  const q = normalize(filter.q?.trim() ?? '');
  const result = db.posts.filter(
    (p) =>
      isPublic(p) &&
      (q === '' || normalize(p.title).includes(q)) &&
      (!filter.kind || p.kind === filter.kind),
  );

  if (filter.sort === 'date-desc') {
    return [...result].sort((a, b) => b.date.localeCompare(a.date));
  }
  if (filter.sort === 'date-asc') {
    return [...result].sort((a, b) => a.date.localeCompare(b.date));
  }
  return result;
}

/** Lấy 1 tin công khai theo id; không công khai thì trả undefined. */
export async function getPublicPost(id: number): Promise<Post | undefined> {
  return db.posts.find((p) => p.id === id && isPublic(p));
}
