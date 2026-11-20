'use client';

import { usePathname } from 'next/navigation';
import '@/assets/css/PageFade.css';

// Un seul fondu court par changement de page ; les paramètres de recherche ne le relancent pas
export default function PageFade({ children }) {
  return (
    <div key={usePathname()} className="page-fade">
      {children}
    </div>
  );
}
