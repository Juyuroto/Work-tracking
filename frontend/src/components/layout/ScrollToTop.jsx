'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Nouvelle page : remonte en haut du document (barre de navigation comprise), en douceur via
// `scroll-behavior: smooth` de global.css. Rien au premier affichage ni sur retour/avance du navigateur,
// pour garder la position restaurée. Les filtres (?status=) ne changent pas le pathname : pas de défilement.
export default function ScrollToTop() {
  const pathname = usePathname();
  const isFirst = useRef(true);
  const fromHistory = useRef(false);

  useEffect(() => {
    const markHistory = () => {
      fromHistory.current = true;
    };
    window.addEventListener('popstate', markHistory);
    return () => window.removeEventListener('popstate', markHistory);
  }, []);

  useEffect(() => {
    if (isFirst.current || fromHistory.current) {
      isFirst.current = false;
      fromHistory.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return null;
}
