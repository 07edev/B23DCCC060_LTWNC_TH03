import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PostFormState } from '@/lib/post-validate';
import PostForm from './PostForm';

type Action = (prev: PostFormState, formData: FormData) => Promise<PostFormState>;

const submitButton = () => screen.getByRole('button', { name: 'Đăng tin' });

describe('PostForm', () => {
  it('mặc định Loại liên hệ là Zalo', () => {
    render(<PostForm action={vi.fn<Action>()} />);
    expect(screen.getByLabelText('Loại liên hệ')).toHaveValue('Zalo');
  });

  it('action trả errors thì lỗi hiện ra dưới đúng ô', async () => {
    const user = userEvent.setup();
    const action = vi.fn<Action>().mockResolvedValue({
      errors: { title: 'Tiêu đề tối thiểu 5 ký tự', contact: 'Số Zalo gồm 10 chữ số, bắt đầu bằng 0' },
      values: { title: 'abc', contactType: 'Zalo' },
    });
    render(<PostForm action={action} />);

    await user.click(submitButton());

    expect(await screen.findByLabelText('Tiêu đề')).toHaveAccessibleDescription(
      'Tiêu đề tối thiểu 5 ký tự',
    );
    expect(screen.getByLabelText('Thông tin liên hệ')).toHaveAccessibleDescription(
      'Số Zalo gồm 10 chữ số, bắt đầu bằng 0',
    );
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.getByLabelText('Mô tả')).not.toHaveAccessibleDescription();
  });

  it('điền hợp lệ thì action được gọi 1 lần với FormData đúng kind, contactType, contact', async () => {
    const user = userEvent.setup();
    const action = vi.fn<Action>().mockResolvedValue({
      errors: {},
      values: {},
      message: 'Đã gửi tin, chờ kiểm duyệt',
      ok: true,
    });
    render(<PostForm action={action} />);

    await user.type(screen.getByLabelText('Tiêu đề'), 'Nhặt được ví da màu nâu');
    await user.selectOptions(screen.getByLabelText('Loại tin'), 'Nhặt được');
    await user.selectOptions(screen.getByLabelText('Danh mục'), 'Ví – giấy tờ');
    await user.selectOptions(screen.getByLabelText('Địa điểm'), 'Thư viện');
    await user.type(screen.getByLabelText('Ngày'), '2020-01-01');
    await user.type(screen.getByLabelText('Mô tả'), 'Ví da màu nâu nhặt được ở tầng 1 thư viện');
    await user.selectOptions(screen.getByLabelText('Loại liên hệ'), 'Email');
    await user.type(screen.getByLabelText('Thông tin liên hệ'), 'sv01@ptit.edu.vn');
    await user.click(submitButton());

    expect(await screen.findByRole('status')).toHaveTextContent('Đã gửi tin, chờ kiểm duyệt');
    expect(action).toHaveBeenCalledTimes(1);
    const formData = action.mock.calls[0][1];
    expect(formData.get('kind')).toBe('Nhặt được');
    expect(formData.get('contactType')).toBe('Email');
    expect(formData.get('contact')).toBe('sv01@ptit.edu.vn');
    expect(formData.get('date')).toBe('2020-01-01');
  });

  it('action trả message Không có quyền cùng values thì hiện thông báo và giữ tiêu đề đã nhập', async () => {
    const user = userEvent.setup();
    const action = vi.fn<Action>().mockResolvedValue({
      errors: {},
      values: { title: 'Mất chìa khóa xe máy', contactType: 'SĐT' },
      message: 'Không có quyền',
    });
    render(<PostForm action={action} />);

    await user.type(screen.getByLabelText('Tiêu đề'), 'Mất chìa khóa xe máy');
    await user.click(submitButton());

    expect(await screen.findByRole('status')).toHaveTextContent('Không có quyền');
    expect(screen.getByLabelText('Tiêu đề')).toHaveValue('Mất chìa khóa xe máy');
    expect(screen.getByLabelText('Loại liên hệ')).toHaveValue('SĐT');
  });
});
