import Link from 'next/link';
import '@/assets/css/StatCard.css';

export default function StatCard({ label, value, hint, href, className }) {
  const Tag = href ? Link : 'div';
  const classes = ['stat-card', href && 'stat-card--link', className].filter(Boolean).join(' ');

  return (
    <Tag className={classes} href={href}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {hint && <span className="stat-card__hint">{hint}</span>}
    </Tag>
  );
}
