import { listCompanies } from '@/lib/api';
import ContactForm from '@/components/contacts/ContactForm';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = { title: 'Nouveau contact' };

export default async function NewContactPage({ searchParams }) {
  const { company_id: companyId } = await searchParams;
  const companies = await listCompanies();

  return (
    <>
      <PageHeader title="Nouveau contact" />
      <ContactForm companies={companies} contact={{ company_id: companyId }} cancelHref="/contacts" />
    </>
  );
}
