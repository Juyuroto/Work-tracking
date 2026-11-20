import Link from 'next/link';
import { listContacts } from '@/lib/api';
import { formatDate } from '@/lib/format';
import EmptyState from '@/components/ui/EmptyState';
import EntityList from '@/components/ui/EntityList';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = { title: 'Contacts' };

export default async function ContactsPage() {
  const contacts = await listContacts();
  const items = contacts.map((contact) => ({
    key: contact.id,
    href: `/contacts/${contact.id}`,
    title: contact.name,
    meta: [
      contact.role,
      contact.company_name,
      contact.last_interaction_on ? `Dernier échange : ${formatDate(contact.last_interaction_on)}` : 'Aucun échange',
    ],
  }));

  return (
    <>
      <PageHeader title="Contacts">
        <Link className="btn btn--primary" href="/contacts/nouveau">
          Nouveau contact
        </Link>
      </PageHeader>
      {items.length > 0 ? (
        <EntityList items={items} />
      ) : (
        <EmptyState title="Aucun contact pour l'instant." action={{ href: '/contacts/nouveau', label: 'Ajouter un contact' }}>
          Recruteurs, tuteurs, anciens de l&apos;école : gardez trace de chaque personne rencontrée.
        </EmptyState>
      )}
    </>
  );
}
