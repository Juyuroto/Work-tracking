import Link from 'next/link';
import { listCompanies } from '@/lib/api';
import { plural } from '@/lib/format';
import EmptyState from '@/components/ui/EmptyState';
import EntityList from '@/components/ui/EntityList';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = { title: 'Entreprises' };

export default async function CompaniesPage() {
  const companies = await listCompanies();
  const items = companies.map((company) => ({
    key: company.id,
    href: `/entreprises/${company.id}`,
    title: company.name,
    meta: [
      company.sector,
      company.city,
      plural(company.applications_count, 'candidature'),
      plural(company.contacts_count, 'contact'),
    ],
  }));

  return (
    <>
      <PageHeader title="Entreprises">
        <Link className="btn btn--primary" href="/entreprises/nouvelle">
          Nouvelle entreprise
        </Link>
      </PageHeader>
      {items.length > 0 ? (
        <EntityList items={items} />
      ) : (
        <EmptyState title="Aucune entreprise pour l'instant." action={{ href: '/entreprises/nouvelle', label: 'Ajouter une entreprise' }}>
          Une entreprise regroupe ses contacts et vos candidatures.
        </EmptyState>
      )}
    </>
  );
}
