import { CATEGORIES, KINDS, PLACES } from '../data/posts';
import type { Category, Kind, Place } from '../types';

export interface PostInput {
  title: string; kind: string; category: string; place: string;
  date: string; description: string;
  contactType: string; contact: string;
}
export type PostErrors = Partial<Record<keyof PostInput, string>>;
export interface PostFormState {
  errors: PostErrors; // lỗi từng ô
  values: Partial<PostInput>; // giá trị đã nhập, để hiện lại khi có lỗi
  message?: string; // thông báo chung (thành công hoặc lỗi từ server)
  ok?: boolean; // true nếu message là thông báo thành công
}

export const CONTACT_TYPES = ['Zalo', 'SĐT', 'Email'] as const;

const FIELDS: (keyof PostInput)[] = [
  'title', 'kind', 'category', 'place', 'date', 'description', 'contactType', 'contact',
];

export const isKind = (v: string): v is Kind => KINDS.some((k) => k === v);
export const isCategory = (v: string): v is Category => CATEGORIES.some((c) => c === v);
export const isPlace = (v: string): v is Place => PLACES.some((p) => p === v);

const pad = (n: number): string => String(n).padStart(2, '0');

/** Ngày hôm nay dạng YYYY-MM-DD (theo giờ máy). */
export const today = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Đổi FormData / object thành PostInput (giá trị form luôn là chuỗi). */
export function toPostInput(raw: FormData | Record<string, unknown>): PostInput {
  const read = (key: keyof PostInput): string => {
    const v = raw instanceof FormData ? raw.get(key) : raw[key];
    return typeof v === 'string' ? v : '';
  };
  const input = Object.fromEntries(FIELDS.map((f) => [f, read(f)])) as Record<
    keyof PostInput,
    string
  >;
  return { ...input, contactType: input.contactType || 'Zalo' };
}

const isValidDate = (s: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

const PHONE_RE = /^0\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(type: string, contact: string): string | undefined {
  switch (type) {
    case 'Zalo':
      return PHONE_RE.test(contact) ? undefined : 'Số Zalo gồm 10 chữ số, bắt đầu bằng 0';
    case 'SĐT':
      return PHONE_RE.test(contact) ? undefined : 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0';
    case 'Email':
      return EMAIL_RE.test(contact) ? undefined : 'Email không hợp lệ';
    default:
      return 'Hãy chọn loại liên hệ';
  }
}

/** Nơi duy nhất giữ quy tắc kiểm tra tin đăng. Object rỗng = hợp lệ. */
export function validatePost(input: PostInput): PostErrors {
  const errors: PostErrors = {};

  const title = input.title.trim();
  if (title.length < 5) errors.title = 'Tiêu đề tối thiểu 5 ký tự';
  else if (title.length > 80) errors.title = 'Tiêu đề tối đa 80 ký tự';

  if (!isKind(input.kind)) errors.kind = 'Hãy chọn loại tin';
  if (!isCategory(input.category)) errors.category = 'Hãy chọn danh mục';
  if (!isPlace(input.place)) errors.place = 'Hãy chọn địa điểm';

  if (!isValidDate(input.date)) errors.date = 'Hãy chọn ngày';
  else if (input.date.localeCompare(today()) > 0) errors.date = 'Ngày không được ở tương lai';

  if (input.description.trim().length < 20) errors.description = 'Mô tả tối thiểu 20 ký tự';

  const contactError = validateContact(input.contactType, input.contact.trim());
  if (contactError) errors.contact = contactError;

  return errors;
}
