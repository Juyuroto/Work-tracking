// Serveur seulement : appelle le backend FastAPI (jamais importé par un composant client).
const TIMEOUT_MS = 10_000;
const API_URL = process.env.API_URL ?? 'http://localhost:8000';
export const GENERIC_ERROR = 'Erreur interne, réessayez.';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS), // désactive la mémoïsation GET de Next (voir norme § 4)
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (method === 'GET' && res.status === 404) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(typeof data?.detail === 'string' ? data.detail : GENERIC_ERROR, res.status);
  }
  return res.status === 204 ? null : res.json();
}

// Un id invalide donne null sans appel réseau (→ notFound côté page).
const byId = (path, id) => (Number.isSafeInteger(id) && id > 0 ? request(`${path}/${id}`) : null);

export const getDashboard = () => request('/dashboard');

export const listCompanies = () => request('/companies');
export const getCompany = (id) => byId('/companies', id);
export const createCompany = (body) => request('/companies', { method: 'POST', body });
export const updateCompany = (id, body) => request(`/companies/${id}`, { method: 'PUT', body });
export const deleteCompany = (id) => request(`/companies/${id}`, { method: 'DELETE' });

export const listContacts = () => request('/contacts');
export const getContact = (id) => byId('/contacts', id);
export const createContact = (body) => request('/contacts', { method: 'POST', body });
export const updateContact = (id, body) => request(`/contacts/${id}`, { method: 'PUT', body });
export const deleteContact = (id) => request(`/contacts/${id}`, { method: 'DELETE' });

export function listApplications({ status } = {}) {
  const query = status ? `?${new URLSearchParams({ status })}` : '';
  return request(`/applications${query}`);
}
export const getApplication = (id) => byId('/applications', id);
export const createApplication = (body) => request('/applications', { method: 'POST', body });
export const updateApplication = (id, body) => request(`/applications/${id}`, { method: 'PUT', body });
export const deleteApplication = (id) => request(`/applications/${id}`, { method: 'DELETE' });
export const patchApplicationStatus = (id, status) =>
  request(`/applications/${id}/status`, { method: 'PATCH', body: { status } });

export const createInteraction = (body) => request('/interactions', { method: 'POST', body });
export const deleteInteraction = (id) => request(`/interactions/${id}`, { method: 'DELETE' });
