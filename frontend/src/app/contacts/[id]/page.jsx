import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteContact } from '@/app/actions';
import { getContact, listApplications, listCompanies } from '@/lib/api';
import { formatDate } from '@/lib/format';
import ContactForm from '@/components/contacts/ContactForm';
import DeleteButton from '@/components/ui/DeleteButton';
import InteractionForm from '@/components/interactions/InteractionForm';
import InteractionList from '@/components/interactions/InteractionList';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/ui/Section';

export async function generateMetadata({ params }) {
  const contact = await getContact(Number((await params).id));
  return { title: contact?.name };
}

export default async function ContactPage({ params }) {
  const contactId = Number((await params).id);

  const contact = await getContact(contactId);
  if (!contact) notFound();
  const [companies, allApplications] = await Promise.all([listCompanies(), listApplications()]);
  const applications = allApplications.map(({ id, title, company_name }) => ({ id, title, company_name }));

  const interactions = contact.interactions.map((item) => ({
    ...item,
    linkHref: item.application_id ? `/candidatures/${item.application_id}` : undefined,
    linkLabel: item.application_title,
  }));

  return (
    <>
      <PageHeader
        title={contact.name}
        subtitle={
          <>
            {contact.role && <span>{contact.role}</span>}
            {contact.company_id && <Link href={`/entreprises/${contact.company_id}`}>{contact.company_name}</Link>}
            <span>{contact.last_interaction_on ? `Dernier échange : ${formatDate(contact.last_interaction_on)}` : 'Aucun échange'}</span>
          </>
        }
      >
        {contact.linkedin && (
          <a className="btn" href={contact.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn (nouvel onglet)
          </a>
        )}
      </PageHeader>

      <Section id="echanges" title="Échanges">
        <InteractionList items={interactions} />
      </Section>

      <Section id="ajout-echange" title="Ajouter un échange">
        <InteractionForm key={interactions.length} contactId={contact.id} applications={applications} />
      </Section>

      <Section id="modifier" title="Modifier le contact">
        <ContactForm contact={contact} companies={companies} cancelHref="/contacts" />
      </Section>

      <Section id="suppression" title="Suppression">
        <DeleteButton
          action={deleteContact}
          id={contact.id}
          label="Supprimer le contact"
          confirmMessage="Supprimer ce contact ? Ses échanges non liés à une candidature seront supprimés ; les autres resteront, sans contact associé."
        />
      </Section>
    </>
  );
}
