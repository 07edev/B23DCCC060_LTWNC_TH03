'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

export interface LoginState {
  error?: string;
}

/** Chỉ chấp nhận đường dẫn nội bộ để tránh open redirect. */
const safeCallback = (v: FormDataEntryValue | null): string =>
  typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') ? v : '/my-posts';

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: safeCallback(formData.get('callbackUrl')),
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email hoặc mật khẩu không đúng' };
    }
    // redirect() của Next.js là exception, phải ném lại để chuyển trang.
    throw error;
  }
}
