import type { Kind } from '@/types';

export default function KindBadge({ kind }: { kind: Kind }) {
  return (
    <span className={`badge ${kind === 'Thất lạc' ? 'badge-lost' : 'badge-found'}`}>{kind}</span>
  );
}
