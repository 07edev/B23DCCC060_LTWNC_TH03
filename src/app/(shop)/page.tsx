import Link from 'next/link';
import KindBadge from '@/components/KindBadge';
import { formatDate } from '@/lib/format';
import { getPublicPosts } from '@/lib/posts';
import Icon from '@/components/Icon';

// SSG: trang được sinh sẵn khi build, làm mới bằng revalidatePath khi dữ liệu đổi.
export default async function HomePage() {
  const posts = await getPublicPosts();
  const latest = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <>
      <section className="hero">
        <h1>PTIT Found – Tìm đồ thất lạc</h1>
        <p>
          Đánh rơi thẻ sinh viên, ví, điện thoại hay chìa khóa trong trường? Nhặt được đồ mà
          không biết trả cho ai? Đăng tin tại đây để mọi người cùng giúp.
        </p>
        <div className="hero-stat">{posts.length} tin đang hiển thị</div>
        <div>
          <Link href="/posts" className="btn btn-lg">
            Xem tất cả tin
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">
            <Icon name="pen" size={20} />
          </div>
          <h3>Đăng tin nhanh</h3>
          <p>Thành viên đăng nhập để đăng tin Thất lạc hoặc Nhặt được kèm thông tin liên hệ.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <Icon name="shield" size={20} />
          </div>
          <h3>Kiểm duyệt rõ ràng</h3>
          <p>Mọi tin mới đều được quản trị viên duyệt trước khi hiển thị công khai.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <Icon name="check" size={20} />
          </div>
          <h3>Trả lại tận tay</h3>
          <p>Khi đã nhận lại đồ, người đăng đánh dấu để tin tự ẩn khỏi danh sách.</p>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Tin mới nhất</h2>
          <Link href="/posts?sort=date-desc" className="link-icon">
            Xem thêm <Icon name="arrow-right" size={14} />
          </Link>
        </div>
        <div className="post-grid">
          {latest.map((p) => (
            <Link key={p.id} href={`/posts/${p.id}`} className="post-card">
              <div>
                <KindBadge kind={p.kind} />
              </div>
              <h3>{p.title}</h3>
              <div className="meta">
                <span>
                  <Icon name="pin" size={14} /> {p.place}
                </span>
                <span>
                  <Icon name="calendar" size={14} /> {formatDate(p.date)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
