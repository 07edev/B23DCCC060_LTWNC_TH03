import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from 'next-auth';
import type { PostFormState } from '@/lib/post-validate';

const { authMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn<() => Promise<Session | null>>(),
  revalidatePathMock: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }));

import { createPostAction } from './actions';

const session = (email: string, role: 'member' | 'admin'): Session => ({
  user: { email, name: email, role },
  expires: '2099-01-01T00:00:00.000Z',
});

const validForm = (): FormData => {
  const fd = new FormData();
  fd.set('title', 'Mất tai nghe không dây');
  fd.set('kind', 'Thất lạc');
  fd.set('category', 'Khác');
  fd.set('place', 'Thư viện');
  fd.set('date', '2026-11-10');
  fd.set('description', 'Tai nghe màu trắng, để quên ở tầng 2 thư viện');
  fd.set('contactType', 'Zalo');
  fd.set('contact', '0912345678');
  return fd;
};

const initial: PostFormState = { errors: {}, values: {} };

describe('createPostAction', () => {
  beforeEach(() => {
    authMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it('member gửi tin hợp lệ thì thành công và làm mới /my-posts', async () => {
    authMock.mockResolvedValue(session('sv01@ptit.edu.vn', 'member'));
    const state = await createPostAction(initial, validForm());
    expect(state).toEqual({
      errors: {},
      values: {},
      message: 'Đã gửi tin, chờ kiểm duyệt',
      ok: true,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith('/my-posts');
  });

  it('admin gửi tin thì nhận Không có quyền và giữ lại dữ liệu đã nhập', async () => {
    authMock.mockResolvedValue(session('admin@ptit.edu.vn', 'admin'));
    const state = await createPostAction(initial, validForm());
    expect(state.message).toBe('Không có quyền');
    expect(state.values.title).toBe('Mất tai nghe không dây');
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it('member gửi dữ liệu sai thì trả errors và values, không tạo tin', async () => {
    authMock.mockResolvedValue(session('sv01@ptit.edu.vn', 'member'));
    const fd = validForm();
    fd.set('contact', 'abc');
    const state = await createPostAction(initial, fd);
    expect(state.errors).toEqual({ contact: 'Số Zalo gồm 10 chữ số, bắt đầu bằng 0' });
    expect(state.values.contact).toBe('abc');
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
