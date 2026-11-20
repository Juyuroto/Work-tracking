import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = { title: 'Page introuvable' };

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page introuvable" />
      <EmptyState title="Cet élément n'existe pas ou a été supprimé." action={{ href: '/', label: 'Retour au tableau de bord' }} />
    </>
  );
}
