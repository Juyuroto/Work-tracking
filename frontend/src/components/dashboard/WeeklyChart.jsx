import { formatShortDate } from '@/lib/format';
import '@/assets/css/WeeklyChart.css';

export default function WeeklyChart({ weeks }) {
  const max = Math.max(1, ...weeks.map((week) => week.count));

  return (
    <figure className="weekly-chart">
      <figcaption className="weekly-chart__caption">Candidatures envoyées par semaine (12 dernières semaines)</figcaption>
      <ol className="weekly-chart__bars" aria-hidden="true">
        {weeks.map((week) => (
          <li className="weekly-chart__col" key={week.week_start}>
            <span className="weekly-chart__count">{week.count}</span>
            <span className="weekly-chart__track">
              <span className="weekly-chart__bar" style={{ '--bar-ratio': week.count / max }} />
            </span>
            <span className="weekly-chart__label">{formatShortDate(week.week_start)}</span>
          </li>
        ))}
      </ol>
      {/* sr-only sur un div : sur un <table>, la <caption> est dessinée hors de la boîte masquée et reste visible */}
      <div className="sr-only">
        <table>
          <caption>Candidatures envoyées par semaine</caption>
          <thead>
            <tr>
              <th scope="col">Semaine du</th>
              <th scope="col">Candidatures</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week.week_start}>
                <th scope="row">{formatShortDate(week.week_start)}</th>
                <td>{week.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
