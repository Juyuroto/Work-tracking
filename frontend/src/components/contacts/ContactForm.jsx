import { saveContact } from '@/app/actions';
import Field from '@/components/ui/Field';
import FormShell from '@/components/ui/FormShell';

export default function ContactForm({ contact, companies, cancelHref }) {
  const companyOptions = companies.map((company) => ({ value: company.id, label: company.name }));

  return (
    <FormShell action={saveContact} id={contact?.id} cancelHref={cancelHref}>
      <Field label="Nom" name="name" required defaultValue={contact?.name} />
      <Field label="Entreprise" name="company_id" options={companyOptions} placeholder="Aucune entreprise" defaultValue={contact?.company_id} />
      <Field label="Poste" name="role" defaultValue={contact?.role} />
      <Field label="E-mail" name="email" type="email" defaultValue={contact?.email} />
      <Field label="Téléphone" name="phone" type="tel" defaultValue={contact?.phone} />
      <Field label="LinkedIn" name="linkedin" type="url" placeholder="https://" defaultValue={contact?.linkedin} />
      <Field label="Source (comment l'avez-vous rencontré ?)" name="source" wide defaultValue={contact?.source} />
      <Field label="Notes" name="notes" type="textarea" wide defaultValue={contact?.notes} />
    </FormShell>
  );
}
