import { describe, expect, it } from 'vitest';
import { toPostInput, today, validatePost } from './post-validate';
import type { PostInput } from './post-validate';

const valid: PostInput = {
  title: 'Mất tai nghe không dây',
  kind: 'Thất lạc',
  category: 'Khác',
  place: 'Thư viện',
  date: '2026-11-10',
  description: 'Tai nghe màu trắng, để quên ở tầng 2 thư viện',
  contactType: 'Zalo',
  contact: '0912345678',
};

const tomorrow = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

describe('validatePost', () => {
  it('tin hợp lệ trả về object rỗng', () => {
    expect(validatePost(valid)).toEqual({});
  });

  it('form trống báo đủ lỗi cho từng ô', () => {
    expect(validatePost(toPostInput({}))).toEqual({
      title: 'Tiêu đề tối thiểu 5 ký tự',
      kind: 'Hãy chọn loại tin',
      category: 'Hãy chọn danh mục',
      place: 'Hãy chọn địa điểm',
      date: 'Hãy chọn ngày',
      description: 'Mô tả tối thiểu 20 ký tự',
      contact: 'Số Zalo gồm 10 chữ số, bắt đầu bằng 0',
    });
  });

  it('ngày ở tương lai bị từ chối, hôm nay thì hợp lệ', () => {
    expect(validatePost({ ...valid, date: tomorrow() }).date).toBe('Ngày không được ở tương lai');
    expect(validatePost({ ...valid, date: today() })).toEqual({});
  });

  it('ngày sai định dạng hoặc không tồn tại thì báo hãy chọn ngày', () => {
    expect(validatePost({ ...valid, date: '10/11/2026' }).date).toBe('Hãy chọn ngày');
    expect(validatePost({ ...valid, date: '2026-02-30' }).date).toBe('Hãy chọn ngày');
  });

  it('tiêu đề dưới 5 ký tự sau khi trim và trên 80 ký tự đều báo lỗi', () => {
    expect(validatePost({ ...valid, title: '   abcd   ' }).title).toBe('Tiêu đề tối thiểu 5 ký tự');
    expect(validatePost({ ...valid, title: 'a'.repeat(81) }).title).toBe('Tiêu đề tối đa 80 ký tự');
    expect(validatePost({ ...valid, title: 'a'.repeat(80) }).title).toBeUndefined();
  });

  it('loại tin không tồn tại thì báo hãy chọn loại tin', () => {
    expect(validatePost({ ...valid, kind: 'Bán đồ' }).kind).toBe('Hãy chọn loại tin');
  });

  it('liên hệ Email sai định dạng báo lỗi, đúng định dạng thì hợp lệ', () => {
    expect(validatePost({ ...valid, contactType: 'Email', contact: 'abc' }).contact).toBe(
      'Email không hợp lệ',
    );
    expect(validatePost({ ...valid, contactType: 'Email', contact: 'a@b.c' })).toEqual({});
  });

  it('liên hệ SĐT thiếu số thì báo lỗi số điện thoại', () => {
    expect(validatePost({ ...valid, contactType: 'SĐT', contact: '091234567' }).contact).toBe(
      'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0',
    );
  });

  it('loại liên hệ lạ thì báo hãy chọn loại liên hệ', () => {
    expect(validatePost({ ...valid, contactType: 'Facebook' }).contact).toBe(
      'Hãy chọn loại liên hệ',
    );
  });
});

describe('toPostInput', () => {
  it('trường thiếu thành chuỗi rỗng, loại liên hệ thiếu thì mặc định Zalo', () => {
    const fd = new FormData();
    fd.set('title', 'Mất ví');
    expect(toPostInput(fd)).toEqual({
      title: 'Mất ví', kind: '', category: '', place: '', date: '',
      description: '', contactType: 'Zalo', contact: '',
    });
  });
});
