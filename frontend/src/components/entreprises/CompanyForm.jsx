import { saveCompany } from '@/app/actions';
import Field from '@/components/ui/Field';
import FormShell from '@/components/ui/FormShell';

export default function CompanyForm({ company, cancelHref }) {
  return (
    <FormShell action={saveCompany} id={company?.id} cancelHref={cancelHref}>
      <Field label="Nom" name="name" required defaultValue={company?.name} autoComplete="organization" />
      <Field label="Secteur" name="sector" defaultValue={company?.sector} />
      <Field label="Ville" name="city" defaultValue={company?.city} />
      <Field label="Site web" name="website" type="url" placeholder="https://" defaultValue={company?.website} />
      <Field label="Taille" name="size" defaultValue={company?.size} />
      <Field label="Notes" name="notes" type="textarea" wide defaultValue={company?.notes} />
    </FormShell>
  );
}
