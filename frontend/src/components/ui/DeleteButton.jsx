'use client';

import { startTransition, useActionState } from 'react';

// `action` : server action (prevState, formData) → { error } ou redirection.
export default function DeleteButton({ action, id, confirmMessage, label = 'Supprimer', ariaLabel, small = false }) {
  const [state, formAction, pending] = useActionState(action, null);

  function handleSubmit(event) {
    event.preventDefault();
    if (!window.confirm(confirmMessage)) return;
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={pending}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={`btn btn--danger${small ? ' btn--small' : ''}`} aria-label={ariaLabel} disabled={pending}>
        {label}
      </button>
      <p className="alert" role="alert">
        {state?.error}
      </p>
    </form>
  );
}
