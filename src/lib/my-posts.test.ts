import { describe, expect, it } from 'vitest';
import { db } from './db';
import { listMine, parseStatus, resolvePost, submitPost } from './my-posts';
import type { PostInput } from './post-validate';

const SV01 = 'sv01@ptit.edu.vn';
const SV02 = 'sv02@ptit.edu.vn';

// Các test listMine chạy trước khi submitPost thêm tin vào db.
describe('listMine', () => {
  it('sv01 có 27 tin, lần đầu lấy 8 tin với nextCursor 8', () => {
    const page = listMine(SV01, '');
    expect(page.total).toBe(27);
    expect(page.items).toHaveLength(8);
    expect(page.nextCursor).toBe(8);
    expect(page.items.every((p) => p.authorEmail === SV01)).toBe(true);
  });

  it('trang cuối (cursor 24) có 3 tin và nextCursor là null', () => {
    const page = listMine(SV01, '', 24);
    expect(page.items).toHaveLength(3);
    expect(page.nextCursor).toBeNull();
  });

  it('lọc trạng thái pending của sv01 còn 3 tin', () => {
    const page = listMine(SV01, 'pending');
    expect(page.total).toBe(3);
    expect(page.items.every((p) => p.status === 'pending')).toBe(true);
  });

  it('sv02 có 9 tin', () => {
    expect(listMine(SV02, '').total).toBe(9);
  });
});

describe('parseStatus', () => {
  it('chỉ nhận pending, approved, hidden; giá trị khác coi như không lọc', () => {
    expect(parseStatus('pending')).toBe('pending');
    expect(parseStatus('approved')).toBe('approved');
    expect(parseStatus('hidden')).toBe('hidden');
    expect(parseStatus('abc')).toBe('');
    expect(parseStatus(undefined)).toBe('');
  });
});

describe('submitPost', () => {
  const input: PostInput = {
    title: '  Mất tai nghe không dây  ',
    kind: 'Thất lạc',
    category: 'Khác',
    place: 'Thư viện',
    date: '2026-11-10',
    description: 'Tai nghe màu trắng, để quên ở tầng 2',
    contactType: 'Zalo',
    contact: '0912345678',
  };

  it('tạo tin pending, ghép liên hệ vào mô tả và đặt ở đầu mảng', () => {
    const before = db.posts.length;
    const post = submitPost(SV01, input);

    expect(post).toMatchObject({
      id: 37,
      title: 'Mất tai nghe không dây',
      status: 'pending',
      resolved: false,
      authorEmail: SV01,
    });
    expect(post.description).toBe(
      'Tai nghe màu trắng, để quên ở tầng 2\nLiên hệ: Zalo 0912345678',
    );
    expect(db.posts[0]).toBe(post);
    expect(db.posts).toHaveLength(before + 1);
    expect(db.nextPostId).toBe(38);
    expect(listMine(SV01, '').total).toBe(28);
  });

  it('ném lỗi khi dữ liệu chưa hợp lệ', () => {
    expect(() => submitPost(SV01, { ...input, kind: '' })).toThrow();
  });
});

describe('resolvePost', () => {
  it('trả not-found khi không có tin', () => {
    expect(resolvePost(SV01, 999)).toBe('not-found');
  });

  it('trả forbidden khi không phải tin của mình', () => {
    // tin id 1 của sv02
    expect(resolvePost(SV01, 1)).toBe('forbidden');
  });

  it('trả not-approved khi tin không ở trạng thái approved', () => {
    // tin id 5 đang chờ duyệt, của sv02
    expect(resolvePost(SV02, 5)).toBe('not-approved');
  });

  it('trả ok và đặt resolved = true với tin đang hiển thị của mình', () => {
    expect(resolvePost(SV01, 2)).toBe('ok');
    expect(db.posts.find((p) => p.id === 2)?.resolved).toBe(true);
  });
});
