'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { can } from '@/lib/permissions';
import { moderate } from '@/lib/posts';

export async function moderatePost(
  id: number,
  status: 'approved' | 'hidden',
): Promise<void> {
  // Server Action là endpoint công khai: luôn tự kiểm tra quyền.
  const session = await auth();
  if (!can(session?.user?.role, 'post:moderate')) {
    throw new Error('Không có quyền');
  }

  if (!moderate(id, status)) return;

  revalidatePath('/admin');
  revalidatePath('/posts');
  revalidatePath('/');
  revalidatePath(`/posts/${id}`);
}
