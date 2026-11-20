'use client';

import { useOptimistic, useState, useTransition } from 'react';
import Link from 'next/link';
import { setApplicationStatus } from '@/app/actions';
import { APPLICATION_STATUSES } from '@/lib/labels';
import { formatDate } from '@/lib/format';
import '@/assets/css/KanbanBoard.css';

export default function KanbanBoard({ applications, status }) {
  const [error, setError] = useState('');
  const [draggingId, setDraggingId] = useState(null);
  const [overStatus, setOverStatus] = useState(null);
  const [lastMovedId, setLastMovedId] = useState(null);
  const [pending, startTransition] = useTransition();
  // La carte change de colonne tout de suite ; l'état se défait seul si l'action échoue
  const [shown, moveOptimistic] = useOptimistic(applications, (current, { id, status }) =>
    current.map((item) => (item.id === id ? { ...item, status } : item)),
  );

  const columns = APPLICATION_STATUSES.filter((item) => !status || item.value === status);

  function move(id, status) {
    const application = shown.find((item) => item.id === id);
    if (!application || application.status === status) return;
    setError('');
    startTransition(async () => {
      moveOptimistic({ id, status });
      setLastMovedId(id);
      const result = await setApplicationStatus(id, status);
      if (result?.error) setError(result.error);
    });
  }

  function handleDrop(event, status) {
    event.preventDefault();
    setOverStatus(null);
    setDraggingId(null);
    move(Number(event.dataTransfer.getData('text/plain')), status);
  }

  return (
    <>
      <p className="alert kanban-board__feedback" role="alert">
        {error}
      </p>
      <div className="kanban-board" aria-busy={pending}>
        {columns.map((column) => {
          const cards = shown.filter((application) => application.status === column.value);
          const titleId = `kanban-${column.value}`;
          return (
            <section
              key={column.value}
              className={`kanban-board__column status--${column.value}${overStatus === column.value ? ' kanban-board__column--over' : ''}`}
              aria-labelledby={titleId}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                if (overStatus !== column.value) setOverStatus(column.value);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOverStatus(null);
              }}
              onDrop={(event) => handleDrop(event, column.value)}
            >
              <h2 className="kanban-board__title" id={titleId}>
                {column.label}
                <span className="kanban-board__count">{cards.length}</span>
              </h2>
              {cards.length === 0 ? (
                <p className="kanban-board__empty">Aucune candidature</p>
              ) : (
                <ul className="kanban-board__cards">
                  {cards.map((application) => (
                    <li
                      key={application.id}
                      className={`kanban-board__card${draggingId === application.id ? ' kanban-board__card--dragging' : ''}${lastMovedId === application.id ? ' kanban-board__card--moved' : ''}`}
                      draggable
                      onAnimationEnd={(event) => {
                        if (event.target === event.currentTarget) setLastMovedId(null);
                      }}
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', String(application.id));
                        event.dataTransfer.effectAllowed = 'move';
                        setDraggingId(application.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverStatus(null);
                      }}
                    >
                      <Link className="kanban-board__link" href={`/candidatures/${application.id}`}>
                        {application.title}
                      </Link>
                      <p className="kanban-board__company">{application.company_name}</p>
                      {application.next_action && (
                        <p className="kanban-board__next">
                          {application.next_action}
                          {application.next_action_on && ` (${formatDate(application.next_action_on)})`}
                        </p>
                      )}
                      <select
                        className="control kanban-board__select"
                        aria-label={`Statut de ${application.title}`}
                        value={application.status}
                        onChange={(event) => move(application.id, event.target.value)}
                      >
                        {APPLICATION_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
