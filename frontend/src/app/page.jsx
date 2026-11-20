import { getDashboard } from '@/lib/api';
import { APPLICATION_STATUSES } from '@/lib/labels';
import { formatDate, formatPercent, plural } from '@/lib/format';
import EmptyState from '@/components/ui/EmptyState';
import EntityList from '@/components/ui/EntityList';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/ui/Section';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/candidatures/StatusBadge';
import WeeklyChart from '@/components/dashboard/WeeklyChart';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const { byStatus, sentCount, responseRate, interviewRate, followUps, upcomingInterviews, perWeek } = await getDashboard();
  const noRateHint = sentCount === 0 ? 'Aucune candidature envoyée' : undefined;

  const followUpItems = followUps.map((item) => ({
    key: item.id,
    href: `/candidatures/${item.id}`,
    title: `${item.title} · ${item.company_name}`,
    meta: [item.reason, `À faire depuis le ${formatDate(item.due_on)}`],
    badge: <StatusBadge status={item.status} />,
  }));

  const interviewItems = upcomingInterviews.map((item) => ({
    key: item.id,
    href: item.application_id ? `/candidatures/${item.application_id}` : undefined,
    title: `${formatDate(item.happened_on)} · ${item.application_title ?? 'Entretien'}`,
    meta: [item.company_name, item.contact_name, item.summary],
  }));

  return (
    <>
      <PageHeader title="Dashboard" />

      <Section id="chiffres" title="Chiffres clés">
        <div className="cards-grid">
          <StatCard label="Candidatures envoyées" value={sentCount} href="/candidatures" />
          <StatCard label="Taux de réponse" value={formatPercent(responseRate)} hint={noRateHint ?? 'Entretien, offre ou refus'} />
          <StatCard label="Taux d'entretien" value={formatPercent(interviewRate)} hint={noRateHint ?? 'Entretien ou offre'} />
        </div>
      </Section>

      <Section id="statuts" title="Par statut">
        <div className="cards-grid">
          {APPLICATION_STATUSES.map((status) => (
            <StatCard
              key={status.value}
              label={status.label}
              value={byStatus[status.value]}
              className={`status--${status.value}`}
              href={`/candidatures?status=${status.value}`}
            />
          ))}
        </div>
      </Section>

      <div className="split">
        <Section id="relances" title={`Relances à faire (${followUps.length})`}>
          {followUpItems.length > 0 ? (
            <EntityList items={followUpItems} />
          ) : (
            <EmptyState title="Aucune relance à faire.">Les candidatures envoyées sans réponse depuis 7 jours apparaîtront ici.</EmptyState>
          )}
        </Section>

        <Section id="entretiens" title={`Entretiens à venir (${upcomingInterviews.length})`}>
          {interviewItems.length > 0 ? (
            <EntityList items={interviewItems} />
          ) : (
            <EmptyState title="Aucun entretien prévu.">Ajoutez un échange de type « Entretien » sur une candidature pour le voir ici.</EmptyState>
          )}
        </Section>
      </div>

      <Section id="semaines" title="Rythme d'envoi">
        {perWeek.some((week) => week.count > 0) ? (
          <WeeklyChart weeks={perWeek} />
        ) : (
          <EmptyState title="Aucune candidature envoyée ces 12 dernières semaines." action={{ href: '/candidatures/nouvelle', label: 'Ajouter une candidature' }}>
            {plural(sentCount, 'candidature')} au total.
          </EmptyState>
        )}
      </Section>
    </>
  );
}
