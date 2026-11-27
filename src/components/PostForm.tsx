'use client';

import { useActionState } from 'react';
import { CATEGORIES, KINDS, PLACES } from '@/data/posts';
import { CONTACT_TYPES } from '@/lib/post-validate';
import type { PostErrors, PostFormState, PostInput } from '@/lib/post-validate';
import Icon from './Icon';

export interface PostFormProps {
  action: (prev: PostFormState, formData: FormData) => Promise<PostFormState>;
}

const initialState: PostFormState = { errors: {}, values: {} };

function FieldError({ name, errors }: { name: keyof PostInput; errors: PostErrors }) {
  const message = errors[name];
  if (!message) return null;
  return (
    <p id={`${name}-error`} role="alert" className="error">
      {message}
    </p>
  );
}

export default function PostForm({ action }: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const { errors, values } = state;

  // aria-describedby nối ô nhập với thông báo lỗi ngay dưới nó.
  const describe = (name: keyof PostInput) =>
    errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${name}-error` } : {};

  return (
    // React 19 xóa form sau mỗi lần gửi: đổi key để dựng lại các ô với giá trị trả về.
    <form key={JSON.stringify(values)} action={formAction} className="card" noValidate>
      <div className="card-title">
        <h2>
          <Icon name="pen" /> Đăng tin mới
        </h2>
        <span className="muted small">Tin mới cần quản trị viên duyệt trước khi hiển thị</span>
      </div>

      <div className="form-grid">
        <div className="field full">
          <label htmlFor="title">Tiêu đề</label>
          <input
            id="title"
            name="title"
            placeholder="VD: Mất thẻ sinh viên ở Tòa A2"
            defaultValue={values.title ?? ''}
            {...describe('title')}
          />
          <FieldError name="title" errors={errors} />
        </div>

        <div className="field">
          <label htmlFor="kind">Loại tin</label>
          <select id="kind" name="kind" defaultValue={values.kind ?? ''} {...describe('kind')}>
            <option value="">-- Chọn --</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <FieldError name="kind" errors={errors} />
        </div>

        <div className="field">
          <label htmlFor="category">Danh mục</label>
          <select
            id="category"
            name="category"
            defaultValue={values.category ?? ''}
            {...describe('category')}
          >
            <option value="">-- Chọn --</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError name="category" errors={errors} />
        </div>

        <div className="field">
          <label htmlFor="place">Địa điểm</label>
          <select
            id="place"
            name="place"
            defaultValue={values.place ?? ''}
            {...describe('place')}
          >
            <option value="">-- Chọn --</option>
            {PLACES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <FieldError name="place" errors={errors} />
        </div>

        <div className="field">
          <label htmlFor="date">Ngày</label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={values.date ?? ''}
            {...describe('date')}
          />
          <FieldError name="date" errors={errors} />
        </div>

        <div className="field full">
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Mô tả đặc điểm đồ vật, thời gian, nơi mất/nhặt được… (tối thiểu 20 ký tự)"
            defaultValue={values.description ?? ''}
            {...describe('description')}
          />
          <FieldError name="description" errors={errors} />
        </div>

        <div className="field">
          <label htmlFor="contactType">Loại liên hệ</label>
          <select
            id="contactType"
            name="contactType"
            defaultValue={values.contactType ?? 'Zalo'}
            {...describe('contactType')}
          >
            {CONTACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <FieldError name="contactType" errors={errors} />
        </div>

        <div className="field">
          <label htmlFor="contact">Thông tin liên hệ</label>
          <input
            id="contact"
            name="contact"
            placeholder="0912345678 hoặc email"
            defaultValue={values.contact ?? ''}
            {...describe('contact')}
          />
          <FieldError name="contact" errors={errors} />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={pending}>
          Đăng tin
        </button>
        {state.message && (
          <p role="status" className={`alert ${state.ok ? 'alert-success' : 'alert-error'}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
