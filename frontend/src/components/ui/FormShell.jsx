'use client';

import { startTransition, useActionState } from 'react';
import Link from 'next/link';
import '@/assets/css/FormShell.css';

// `action` : server action (prevState, formData) → { error } ou redirection.
// On soumet via startTransition pour que React ne réinitialise pas les champs après une erreur.
export default function FormShell({ action, id, submitLabel = 'Enregistrer', cancelHref, children }) {
  const [state, formAction, pending] = useActionState(action, null);

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form className="form-shell" onSubmit={handleSubmit} aria-busy={pending}>
      {id != null && <input type="hidden" name="id" value={id} />}
      <div className="form-shell__fields">{children}</div>
      <p className="form-shell__hint">Les champs marqués * sont obligatoires.</p>
      <p className="alert" role="alert">
        {state?.error}
      </p>
      <p className="sr-only" role="status">
        {pending ? 'Enregistrement en cours' : ''}
      </p>
      <div className="form-shell__actions">
        <button type="submit" className="btn btn--primary" disabled={pending}>
          <span className="form-shell__label">
            <span className={pending ? 'form-shell__label--hidden' : undefined}>{submitLabel}</span>
            <span className={pending ? 'form-shell__pending' : 'form-shell__label--hidden'}>Enregistrement…</span>
          </span>
        </button>
        {cancelHref && (
          <Link className="btn" href={cancelHref}>
            Annuler
          </Link>
        )}
      </div>
    </form>
  );
}
