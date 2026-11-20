import { saveApplication } from '@/app/actions';
import { APPLICATION_KINDS, APPLICATION_STATUSES } from '@/lib/labels';
import EmptyState from '@/components/ui/EmptyState';
import Field from '@/components/ui/Field';
import FormShell from '@/components/ui/FormShell';

// `application` peut être partiel (ex. { company_id } pour préremplir une nouvelle candidature).
export default function ApplicationForm({ application, companies, cancelHref }) {
  if (companies.length === 0) {
    return (
      <EmptyState title="Aucune entreprise enregistrée." action={{ href: '/entreprises/nouvelle', label: 'Créer une entreprise' }}>
        Une candidature est rattachée à une entreprise : créez-en une d&apos;abord.
      </EmptyState>
    );
  }

  const companyOptions = companies.map((company) => ({ value: company.id, label: company.name }));

  return (
    <FormShell action={saveApplication} id={application?.id} cancelHref={cancelHref}>
      <Field label="Intitulé du poste" name="title" required wide defaultValue={application?.title} />
      <Field label="Entreprise" name="company_id" required options={companyOptions} placeholder="Choisir une entreprise" defaultValue={application?.company_id} />
      <Field label="Type" name="kind" options={APPLICATION_KINDS} defaultValue={application?.kind ?? 'stage'} />
      <Field label="Statut" name="status" options={APPLICATION_STATUSES} defaultValue={application?.status ?? 'a_postuler'} />
      <Field label="Lien de l'offre" name="url" type="url" placeholder="https://" defaultValue={application?.url} />
      <Field label="Date d'envoi" name="applied_on" type="date" defaultValue={application?.applied_on} />
      <Field label="Version du CV" name="cv_version" defaultValue={application?.cv_version} />
      <Field label="Prochaine action" name="next_action" defaultValue={application?.next_action} />
      <Field label="Date de la prochaine action" name="next_action_on" type="date" defaultValue={application?.next_action_on} />
      <Field label="Notes" name="notes" type="textarea" wide defaultValue={application?.notes} />
    </FormShell>
  );
}
