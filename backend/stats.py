from datetime import date, timedelta

from data import query_all
from validate import APPLICATION_STATUSES


# Calcul sur des dates pures : pas de décalage d'heure d'été.
def add_days(iso, n):
    return (date.fromisoformat(iso) + timedelta(days=n)).isoformat()


def monday_of(iso):
    return add_days(iso, -date.fromisoformat(iso).weekday())  # lundi = 0


def get_dashboard(db, today=None):
    today = today or date.today().isoformat()

    by_status = {s: 0 for s in APPLICATION_STATUSES}
    for r in db.execute("SELECT status, COUNT(*) AS n FROM applications GROUP BY status"):
        by_status[r["status"]] = r["n"]

    sent_count = sum(by_status.values()) - by_status["a_postuler"]

    def rate(n):
        return n / sent_count if sent_count else None

    response_rate = rate(by_status["entretien"] + by_status["offre"] + by_status["refus"])
    # shortcut: statut actuel seulement, refus après entretien non compté ; ajouter un historique des statuts si besoin
    interview_rate = rate(by_status["entretien"] + by_status["offre"])

    follow_ups = []
    for a in query_all(
        db,
        """SELECT a.id, a.title, co.name AS company_name, a.status, a.next_action_on, a.applied_on,
         (SELECT MAX(happened_on) FROM interactions WHERE application_id = a.id) AS last_on
       FROM applications a JOIN companies co ON co.id = a.company_id
       WHERE a.status IN ('envoyee', 'relancee')""",
    ):
        if a["next_action_on"]:
            a.update(due_on=a["next_action_on"], reason="Action prévue")
        else:
            refs = [d for d in (a["last_on"], a["applied_on"]) if d]
            a.update(
                due_on=add_days(max(refs), 7) if refs else None,
                reason="Sans nouvelle depuis 7 jours",
            )
        if a["due_on"] and a["due_on"] <= today:
            follow_ups.append(a)
    follow_ups.sort(key=lambda a: a["due_on"])

    upcoming_interviews = query_all(
        db,
        """SELECT i.id, i.happened_on, i.summary, i.application_id, a.title AS application_title,
         co.name AS company_name, c.name AS contact_name
       FROM interactions i
       LEFT JOIN applications a ON a.id = i.application_id
       LEFT JOIN companies co ON co.id = a.company_id
       LEFT JOIN contacts c ON c.id = i.contact_id
       WHERE i.kind = 'entretien' AND i.happened_on >= ?
       ORDER BY i.happened_on, i.id""",
        (today,),
    )

    this_week = monday_of(today)
    per_week = [{"week_start": add_days(this_week, (i - 11) * 7), "count": 0} for i in range(12)]
    by_week = {w["week_start"]: w for w in per_week}
    for r in db.execute(
        "SELECT applied_on FROM applications WHERE applied_on >= ? AND applied_on < ?",
        (per_week[0]["week_start"], add_days(this_week, 7)),
    ):
        by_week[monday_of(r["applied_on"])]["count"] += 1

    return {
        "byStatus": by_status,
        "sentCount": sent_count,
        "responseRate": response_rate,
        "interviewRate": interview_rate,
        "followUps": follow_ups,
        "upcomingInterviews": upcoming_interviews,
        "perWeek": per_week,
    }
