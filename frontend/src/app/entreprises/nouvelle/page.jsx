import CompanyForm from '@/components/entreprises/CompanyForm';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = { title: 'Nouvelle entreprise' };

export default function NewCompanyPage() {
  return (
    <>
      <PageHeader title="Nouvelle entreprise" />
      <CompanyForm cancelHref="/entreprises" />
    </>
  );
}
