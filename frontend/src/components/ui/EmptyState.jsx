import Link from 'next/link';
import '@/assets/css/EmptyState.css';

export default function EmptyState({ title, children, action }) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {children && <p className="empty-state__text">{children}</p>}
      {action && (
        <Link className="btn btn--primary" href={action.href}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
