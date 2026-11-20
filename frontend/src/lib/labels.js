// Sans import serveur : ce module est aussi utilisé par des composants client.

export const APPLICATION_STATUSES = [
  { value: 'a_postuler', label: 'À postuler' },
  { value: 'envoyee', label: 'Envoyée' },
  { value: 'relancee', label: 'Relancée' },
  { value: 'entretien', label: 'Entretien' },
  { value: 'offre', label: 'Offre' },
  { value: 'refus', label: 'Refus' },
  { value: 'sans_reponse', label: 'Sans réponse' },
];

export const APPLICATION_KINDS = [
  { value: 'stage', label: 'Stage' },
  { value: 'alternance', label: 'Alternance' },
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'autre', label: 'Autre' },
];

export const INTERACTION_KINDS = [
  { value: 'mail', label: 'Mail' },
  { value: 'appel', label: 'Appel' },
  { value: 'entretien', label: 'Entretien' },
  { value: 'salon', label: 'Salon' },
  { value: 'autre', label: 'Autre' },
];
