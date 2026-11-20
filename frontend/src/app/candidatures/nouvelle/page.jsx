import { listCompanies } from '@/lib/api';
import ApplicationForm from '@/components/candidatures/ApplicationForm';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = { title: 'Nouvelle candidature' };

export default async function NewApplicationPage({ searchParams }) {
  const { company_id: companyId } = await searchParams;
  const companies = await listCompanies();

  return (
    <>
      <PageHeader title="Nouvelle candidature" />
      <ApplicationForm companies={companies} application={{ company_id: companyId }} cancelHref="/candidatures" />
    </>
  );
}
