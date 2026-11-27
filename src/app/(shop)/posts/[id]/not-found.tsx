import Link from 'next/link';
import Icon from '@/components/Icon';

export default function PostNotFound() {
  return (
    <div className="center-page">
      <section className="card state-page">
        <div className="state-icon">
          <Icon name="search" size={28} />
        </div>
        <h1>Không tìm thấy tin đăng</h1>
        <p>Tin này không tồn tại, đang chờ duyệt hoặc đã được nhận lại.</p>
        <Link href="/posts" className="btn">
          Quay lại danh sách tin
        </Link>
      </section>
    </div>
  );
}
