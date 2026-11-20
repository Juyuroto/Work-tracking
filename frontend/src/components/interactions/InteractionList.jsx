import Link from 'next/link';
import { deleteInteraction } from '@/app/actions';
import { INTERACTION_KINDS } from '@/lib/labels';
import { formatDate, labelOf } from '@/lib/format';
import DeleteButton from '@/components/ui/DeleteButton';
import EmptyState from '@/components/ui/EmptyState';
import '@/assets/css/InteractionList.css';

// items : { id, happened_on, kind, summary, linkHref?, linkLabel? }
export default function InteractionList({ items }) {
  if (items.length === 0) {
    return <EmptyState title="Aucun échange enregistré.">Ajoutez un mail, un appel ou un entretien avec le formulaire ci-dessous.</EmptyState>;
  }

  return (
    <ol className="list-box">
      {items.map((item) => (
        <li className="list-box__item interaction-list__item" key={item.id}>
          <div className="list-box__main">
            <p className="interaction-list__head">
              <time dateTime={item.happened_on}>{formatDate(item.happened_on)}</time>
              <span className="interaction-list__kind">{labelOf(INTERACTION_KINDS, item.kind)}</span>
              {item.linkHref && item.linkLabel && <Link href={item.linkHref}>{item.linkLabel}</Link>}
            </p>
            {item.summary && <p className="interaction-list__summary">{item.summary}</p>}
          </div>
          <DeleteButton
            action={deleteInteraction}
            id={item.id}
            small
            ariaLabel={`Supprimer l'échange du ${formatDate(item.happened_on)}`}
            confirmMessage="Supprimer cet échange ?"
          />
        </li>
      ))}
    </ol>
  );
}
