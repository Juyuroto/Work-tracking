import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteCompany } from '@/app/actions';
import { getCompany } from '@/lib/api';
import { APPLICATION_KINDS } from '@/lib/labels';
import { formatDate, labelOf } from '@/lib/format';
import CompanyForm from '@/components/entreprises/CompanyForm';
import DeleteButton from '@/components/ui/DeleteButton';
import EmptyState from '@/components/ui/EmptyState';
import EntityList from '@/components/ui/EntityList';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/ui/Section';
import StatusBadge from '@/components/candidatures/StatusBadge';

export async function generateMetadata({ params }) {
  const company = await getCompany(Number((await params).id));
  return { title: company?.name };
}

export default async function CompanyPage({ params }) {
  const companyId = Number((await params).id);

  const company = await getCompany(companyId);
  if (!company) notFound();

  const contactItems = company.contacts.map((contact) => ({
    key: contact.id,
    href: `/contacts/${contact.id}`,
    title: contact.name,
    meta: [contact.role, contact.email],
  }));

  const applicationItems = company.applications.map((application) => ({
    key: application.id,
    href: `/candidatures/${application.id}`,
    title: application.title,
    meta: [labelOf(APPLICATION_KINDS, application.kind), application.applied_on && `Envoyée le ${formatDate(application.applied_on)}`],
    badge: <StatusBadge status={application.status} />,
  }));

  return (
    <>
      <PageHeader
        title={company.name}
        subtitle={[company.sector, company.city, company.size].filter(Boolean).join(' · ')}
      >
        {company.website && (
          <a className="btn" href={company.website} target="_blank" rel="noopener noreferrer">
            Site web (nouvel onglet)
          </a>
        )}
      </PageHeader>

      <div className="split">
        <Section
          id="candidatures"
          title="Candidatures"
          action={
            <Link className="btn btn--small" href={`/candidatures/nouvelle?company_id=${company.id}`}>
              Ajouter
            </Link>
          }
        >
          {applicationItems.length > 0 ? <EntityList items={applicationItems} /> : <EmptyState title="Aucune candidature chez cette entreprise." />}
        </Section>

        <Section
          id="contacts"
          title="Contacts"
          action={
            <Link className="btn btn--small" href={`/contacts/nouveau?company_id=${company.id}`}>
              Ajouter
            </Link>
          }
        >
          {contactItems.length > 0 ? <EntityList items={contactItems} /> : <EmptyState title="Aucun contact dans cette entreprise." />}
        </Section>
      </div>

      <Section id="modifier" title="Modifier l'entreprise">
        <CompanyForm company={company} cancelHref="/entreprises" />
      </Section>

      <Section id="suppression" title="Suppression">
        <DeleteButton
          action={deleteCompany}
          id={company.id}
          label="Supprimer l'entreprise"
          confirmMessage="Supprimer cette entreprise et toutes ses candidatures ? Les contacts seront conservés sans entreprise."
        />
      </Section>
    </>
  );
}
