import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteApplication } from '@/app/actions';
import { getApplication, listCompanies, listContacts } from '@/lib/api';
import ApplicationForm from '@/components/candidatures/ApplicationForm';
import DeleteButton from '@/components/ui/DeleteButton';
import InteractionForm from '@/components/interactions/InteractionForm';
import InteractionList from '@/components/interactions/InteractionList';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/ui/Section';
import StatusBadge from '@/components/candidatures/StatusBadge';

export async function generateMetadata({ params }) {
  const application = await getApplication(Number((await params).id));
  return { title: application?.title };
}

export default async function ApplicationPage({ params }) {
  const applicationId = Number((await params).id);

  const application = await getApplication(applicationId);
  if (!application) notFound();
  const [companies, contacts] = await Promise.all([listCompanies(), listContacts()]);

  const interactions = application.interactions.map((item) => ({
    ...item,
    linkHref: item.contact_id ? `/contacts/${item.contact_id}` : undefined,
    linkLabel: item.contact_name,
  }));

  return (
    <>
      <PageHeader
        title={application.title}
        subtitle={
          <>
            <Link href={`/entreprises/${application.company_id}`}>{application.company_name}</Link>
            <StatusBadge status={application.status} />
          </>
        }
      >
        {application.url && (
          <a className="btn" href={application.url} target="_blank" rel="noopener noreferrer">
            Voir l&apos;offre (nouvel onglet)
          </a>
        )}
      </PageHeader>

      <Section id="echanges" title="Échanges">
        <InteractionList items={interactions} />
      </Section>

      <Section id="ajout-echange" title="Ajouter un échange">
        <InteractionForm key={interactions.length} applicationId={application.id} contacts={contacts} />
      </Section>

      <Section id="modifier" title="Modifier la candidature">
        <ApplicationForm application={application} companies={companies} cancelHref="/candidatures" />
      </Section>

      <Section id="suppression" title="Suppression">
        <DeleteButton
          action={deleteApplication}
          id={application.id}
          label="Supprimer la candidature"
          confirmMessage="Supprimer cette candidature et ses échanges ?"
        />
      </Section>
    </>
  );
}
