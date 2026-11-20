import '@/assets/css/variables.css';
import '@/assets/css/global.css';
import Nav from '@/components/layout/Nav';
import PageFade from '@/components/layout/PageFade';
import ScrollToTop from '@/components/layout/ScrollToTop';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: { default: 'Work-tracking', template: '%s · Work-tracking' },
  description: 'Suivi personnel de recherche de stage : entreprises, contacts, candidatures et échanges.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <ScrollToTop />
        <Nav />
        <main id="contenu" className="page">
          <PageFade>{children}</PageFade>
        </main>
      </body>
    </html>
  );
}
