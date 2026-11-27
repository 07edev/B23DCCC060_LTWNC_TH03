'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import type { LoginState } from './actions';

interface LoginFormProps {
  callbackUrl: string;
}

const initialState: LoginState = {};

export default function LoginForm({ callbackUrl }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="sv01@ptit.edu.vn"
        />
      </div>
      <div className="field">
        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>
      {state.error && (
        <p role="alert" className="alert alert-error">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending}>
        Đăng nhập
      </button>
    </form>
  );
}
