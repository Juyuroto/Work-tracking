'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as api from '@/lib/api';

// Erreurs attendues (< 500) → message FR du backend ; le reste (500, backend injoignable) reste générique.
function toError(e) {
  if (e instanceof api.ApiError && e.status < 500) return { error: e.message };
  console.error(e);
  return { error: api.GENERIC_ERROR };
}

// Création (id absent) ou mise à jour. pathFn null : pas de redirection, renvoie { ok: true }.
async function save(formData, { create, update }, pathFn) {
  const body = Object.fromEntries(formData);
  const rawId = formData.get('id');
  let id;
  try {
    ({ id } = rawId ? await update(Number(rawId), body) : await create(body));
  } catch (e) {
    return toError(e);
  }
  revalidatePath('/', 'layout'); // mono-utilisateur : tout invalider reste bon marché
  if (!pathFn) return { ok: true };
  redirect(pathFn(id));
}

export const saveCompany = async (prevState, formData) =>
  save(formData, { create: api.createCompany, update: api.updateCompany }, (id) => `/entreprises/${id}`);

export const saveContact = async (prevState, formData) =>
  save(formData, { create: api.createContact, update: api.updateContact }, (id) => `/contacts/${id}`);

export const saveApplication = async (prevState, formData) =>
  save(formData, { create: api.createApplication, update: api.updateApplication }, (id) => `/candidatures/${id}`);

export const saveInteraction = async (prevState, formData) =>
  save(formData, { create: api.createInteraction }, null);

async function remove(call, formData, listPath) {
  try {
    await call(Number(formData.get('id')));
  } catch (e) {
    return toError(e);
  }
  revalidatePath('/', 'layout');
  if (listPath) redirect(listPath);
}

export async function deleteCompany(prevState, formData) {
  return remove(api.deleteCompany, formData, '/entreprises');
}

export async function deleteContact(prevState, formData) {
  return remove(api.deleteContact, formData, '/contacts');
}

export async function deleteApplication(prevState, formData) {
  return remove(api.deleteApplication, formData, '/candidatures');
}

export async function deleteInteraction(prevState, formData) {
  return remove(api.deleteInteraction, formData);
}

export async function setApplicationStatus(id, status) {
  try {
    await api.patchApplicationStatus(Number(id), status);
  } catch (e) {
    return toError(e);
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}
