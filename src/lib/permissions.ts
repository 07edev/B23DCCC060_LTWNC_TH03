import type { Role } from '../types';

export type Action = 'post:view' | 'post:create' | 'post:resolve' | 'post:moderate';

type Actor = Role | 'guest';

const MATRIX: Record<Action, Actor[]> = {
  'post:view': ['guest', 'member', 'admin'],
  'post:create': ['member'],
  'post:resolve': ['member'],
  'post:moderate': ['admin'],
};

/** Kiểm tra quyền; role undefined nghĩa là khách (chưa đăng nhập). */
export function can(role: Role | undefined, action: Action): boolean {
  return MATRIX[action].includes(role ?? 'guest');
}
