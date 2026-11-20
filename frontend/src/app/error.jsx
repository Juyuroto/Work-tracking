'use client';

import EmptyState from '@/components/ui/EmptyState';

export default function Error({ reset }) {
  return (
    <EmptyState title="Une erreur est survenue.">
      La page n&apos;a pas pu s&apos;afficher. Réessayez dans un instant.
      <button type="button" className="btn" onClick={reset}>
        Réessayer
      </button>
    </EmptyState>
  );
}
