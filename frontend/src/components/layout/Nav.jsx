'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/assets/css/Nav.css';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/candidatures', label: 'Candidatures' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/entreprises', label: 'Entreprises' },
];

export default function Nav() {
  const pathname = usePathname();
  const menuRef = useRef(null);
  const [indicator, setIndicator] = useState(null);
  // Onglet cliqué dont la page n'est pas encore arrivée : le trait y va tout de suite, sans attendre le serveur
  // Stocké avec le pathname de départ : dès que le pathname change, il est périmé et remis à null.
  const [pending, setPending] = useState(null);
  if (pending && pending.from !== pathname) setPending(null); // ajustement pendant le rendu, sans effet
  const pendingHref = pending?.href ?? null;
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  // Un seul trait qui glisse vers l'onglet visé : position et largeur mesurées, animées en transform
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const place = () => {
      const target = menu.querySelector(pendingHref ? `.nav__link[href="${pendingHref}"]` : '[aria-current="page"]');
      if (!target) {
        setIndicator((previous) => previous && { ...previous, hidden: true });
        return;
      }
      const box = menu.getBoundingClientRect();
      const link = target.getBoundingClientRect();
      setIndicator((previous) => ({
        x: link.left - box.left,
        y: link.bottom - box.top,
        w: link.width,
        ready: Boolean(previous),
      }));
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(menu);
    return () => observer.disconnect();
  }, [pathname, pendingHref]);

  function handleClick(event, href) {
    // Ctrl/Cmd/Maj-clic ou clic du milieu ouvrent un autre onglet : le trait ne bouge pas
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setPending({ href, from: pathname });
  }

  return (
    <header className="nav">
      <div className="nav__inner">
        <span className="nav__brand">Work-tracking</span>
        <nav className="nav__menu" ref={menuRef} aria-label="Navigation principale">
          <ul className="nav__list">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  className="nav__link"
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  onClick={(event) => handleClick(event, href)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          {indicator && (
            <span
              className={`nav__indicator${indicator.ready ? ' nav__indicator--ready' : ''}${indicator.hidden ? ' nav__indicator--hidden' : ''}`}
              style={{ '--x': indicator.x, '--y': indicator.y, '--w': indicator.w }}
              aria-hidden="true"
            />
          )}
        </nav>
      </div>
    </header>
  );
}
