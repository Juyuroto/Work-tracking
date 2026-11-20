import Link from 'next/link';
import '@/assets/css/EntityList.css';

export default function EntityList({ items }) {
  return (
    <ul className="list-box">
      {items.map((item) => (
        <li className="list-box__item" key={item.key}>
          <div className="list-box__main">
            {item.href ? (
              <Link className="entity-list__title" href={item.href}>
                {item.title}
              </Link>
            ) : (
              <span className="entity-list__title">{item.title}</span>
            )}
            {item.meta?.some(Boolean) && <p className="entity-list__meta">{item.meta.filter(Boolean).join(' · ')}</p>}
          </div>
          {item.badge}
        </li>
      ))}
    </ul>
  );
}
