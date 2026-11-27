import Icon from '@/components/Icon';

export default function MemberLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <p className="member-banner">
        <Icon name="lock" size={14} />
        Khu vực thành viên
      </p>
      {children}
    </>
  );
}
