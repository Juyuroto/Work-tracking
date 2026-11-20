import { APPLICATION_STATUSES } from '@/lib/labels';
import { labelOf } from '@/lib/format';
import '@/assets/css/StatusBadge.css';

export default function StatusBadge({ status }) {
  return <span className={`status-badge status--${status}`}>{labelOf(APPLICATION_STATUSES, status)}</span>;
}
