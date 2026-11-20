import unittest
from datetime import date

from db import connect
from stats import get_dashboard

TODAY = "2026-11-20"  # vendredi


class TestStats(unittest.TestCase):
    def setUp(self):
        self.db = connect(":memory:")
        self.addCleanup(self.db.close)
        self.company_id = self.db.execute("INSERT INTO companies (name) VALUES ('Acme Fictive')").lastrowid

    def app(self, status, applied_on=None, next_action_on=None):
        return self.db.execute(
            "INSERT INTO applications (company_id, title, status, applied_on, next_action_on) VALUES (?, ?, ?, ?, ?)",
            (self.company_id, "Poste test", status, applied_on, next_action_on),
        ).lastrowid

    def interaction(self, application_id, happened_on, kind="mail"):
        self.db.execute(
            "INSERT INTO interactions (application_id, happened_on, kind) VALUES (?, ?, ?)",
            (application_id, happened_on, kind),
        )

    def follow_ups(self):
        return get_dashboard(self.db, TODAY)["followUps"]

    def test_relance_due_a_j7_pas_a_j6(self):
        due = self.app("envoyee", "2026-11-13")
        self.app("envoyee", "2026-11-14")
        f = self.follow_ups()
        self.assertEqual([x["id"] for x in f], [due])
        self.assertEqual(f[0]["reason"], "Sans nouvelle depuis 7 jours")

    def test_relance_echange_recent_repousse(self):
        a = self.app("relancee", "2026-11-01")
        self.interaction(a, "2026-11-18")
        self.assertEqual(len(self.follow_ups()), 0)
        self.interaction(a, "2026-11-10")  # le plus récent compte (18/11), pas le dernier inséré
        self.assertEqual(len(self.follow_ups()), 0)
        b = self.app("envoyee", "2026-11-01")
        self.interaction(b, "2026-11-13")
        self.assertEqual([x["id"] for x in self.follow_ups()], [b])

    def test_relance_action_prevue(self):
        a = self.app("envoyee", "2026-11-19", "2026-11-20")
        self.app("envoyee", "2026-11-19", "2026-11-21")  # action future : pas due
        f = self.follow_ups()
        self.assertEqual([x["id"] for x in f], [a])
        self.assertEqual(f[0]["reason"], "Action prévue")

    def test_relance_jamais_pour_a_postuler_refus_offre(self):
        for s in ["a_postuler", "refus", "offre"]:
            self.app(s, "2026-01-01", "2026-01-02")
        self.assertEqual(len(self.follow_ups()), 0)

    def test_taux(self):
        self.app("a_postuler")
        d = get_dashboard(self.db, TODAY)
        self.assertIsNone(d["responseRate"])
        self.assertIsNone(d["interviewRate"])
        for s in ["envoyee", "relancee", "entretien", "offre", "refus", "sans_reponse", "envoyee"]:
            self.app(s)
        d = get_dashboard(self.db, TODAY)
        self.assertEqual(d["sentCount"], 7)
        self.assertEqual(d["responseRate"], 3 / 7)
        self.assertEqual(d["interviewRate"], 2 / 7)

    def test_per_week(self):
        self.app("envoyee", "2026-11-15")  # dimanche → semaine du 09/11
        self.app("envoyee", "2026-11-16")  # lundi → semaine du 16/11
        self.app("envoyee", "2026-11-16")
        self.app("envoyee", "2026-08-30")  # avant la fenêtre : ignorée
        w = get_dashboard(self.db, TODAY)["perWeek"]
        self.assertEqual(len(w), 12)
        self.assertEqual(w[0]["week_start"], "2026-08-31")
        self.assertEqual(w[11]["week_start"], "2026-11-16")
        for x in w:
            self.assertEqual(date.fromisoformat(x["week_start"]).weekday(), 0)
        for i in range(1, 12):
            delta = date.fromisoformat(w[i]["week_start"]) - date.fromisoformat(w[i - 1]["week_start"])
            self.assertEqual(delta.days, 7)
        self.assertEqual(w[10]["count"], 1)
        self.assertEqual(w[11]["count"], 2)
        self.assertEqual(sum(x["count"] for x in w), 3)

    def test_entretiens_a_venir(self):
        a = self.app("entretien")
        self.interaction(a, "2026-11-25", "entretien")
        self.interaction(a, "2026-11-20", "entretien")
        self.interaction(a, "2026-11-19", "entretien")
        self.interaction(a, "2026-11-30", "mail")
        upcoming = get_dashboard(self.db, TODAY)["upcomingInterviews"]
        self.assertEqual([x["happened_on"] for x in upcoming], ["2026-11-20", "2026-11-25"])


if __name__ == "__main__":
    unittest.main()
