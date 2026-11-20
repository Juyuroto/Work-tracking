import Link from 'next/link';
import { listApplications } from '@/lib/api';
import { APPLICATION_STATUSES } from '@/lib/labels';
import EmptyState from '@/components/ui/EmptyState';
import KanbanBoard from '@/components/candidatures/KanbanBoard';
import PageHeader from '@/components/layout/PageHeader';
import StatusFilter from '@/components/candidatures/StatusFilter';

export const metadata = { title: 'Candidatures' };

export default async function ApplicationsPage({ searchParams }) {
  const { status } = await searchParams;
  const current = APPLICATION_STATUSES.some((item) => item.value === status) ? status : undefined;
  const applications = await listApplications({ status: current });

  return (
    <>
      <PageHeader title="Candidatures">
        <Link className="btn btn--primary" href="/candidatures/nouvelle">
          Nouvelle candidature
        </Link>
      </PageHeader>
      <StatusFilter current={current} />
      {applications.length === 0 && !current ? (
        <EmptyState title="Aucune candidature pour l'instant." action={{ href: '/candidatures/nouvelle', label: 'Ajouter ma première candidature' }}>
          Chaque candidature apparaît ici dans la colonne de son statut.
        </EmptyState>
      ) : (
        <KanbanBoard applications={applications} status={current} />
      )}
    </>
  );
}
