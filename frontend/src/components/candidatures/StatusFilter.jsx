import Link from 'next/link';
import { APPLICATION_STATUSES } from '@/lib/labels';
import '@/assets/css/StatusFilter.css';

export default function StatusFilter({ current }) {
  const links = [{ value: undefined, label: 'Toutes' }, ...APPLICATION_STATUSES];

  return (
    <nav aria-label="Filtrer par statut">
      <ul className="status-filter">
        {links.map(({ value, label }) => (
          <li key={value ?? 'all'}>
            <Link
              className="status-filter__link"
              href={value ? `/candidatures?status=${value}` : '/candidatures'}
              scroll={false}
              aria-current={current === value ? 'page' : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
