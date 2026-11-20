import { saveInteraction } from '@/app/actions';
import { INTERACTION_KINDS } from '@/lib/labels';
import { localToday } from '@/lib/format';
import Field from '@/components/ui/Field';
import FormShell from '@/components/ui/FormShell';

// Fixer `applicationId` ou `contactId` depuis une fiche ; sinon un sélecteur est affiché (listes en props).
export default function InteractionForm({ applicationId, contactId, applications = [], contacts = [] }) {
  const applicationOptions = applications.map((item) => ({ value: item.id, label: `${item.title} (${item.company_name})` }));
  const contactOptions = contacts.map((item) => ({ value: item.id, label: item.name }));

  return (
    <FormShell action={saveInteraction} submitLabel="Ajouter l'échange">
      {applicationId != null ? (
        <input type="hidden" name="application_id" value={applicationId} />
      ) : (
        <Field label="Candidature" name="application_id" options={applicationOptions} placeholder="Aucune candidature" />
      )}
      {contactId != null ? (
        <input type="hidden" name="contact_id" value={contactId} />
      ) : (
        <Field label="Contact" name="contact_id" options={contactOptions} placeholder="Aucun contact" />
      )}
      <Field label="Date" name="happened_on" type="date" required defaultValue={localToday()} />
      <Field label="Type" name="kind" options={INTERACTION_KINDS} defaultValue="mail" />
      <Field label="Résumé" name="summary" type="textarea" wide />
    </FormShell>
  );
}
