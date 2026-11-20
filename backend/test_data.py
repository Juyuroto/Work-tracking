import unittest

from data import list_applications, list_companies, list_contacts
from db import connect


class TestData(unittest.TestCase):
    def setUp(self):
        self.db = connect(":memory:")
        self.addCleanup(self.db.close)
        ins = lambda sql, *p: self.db.execute(sql, p).lastrowid
        zeta = ins("INSERT INTO companies (name) VALUES ('zeta Fictive')")
        self.acme = ins("INSERT INTO companies (name) VALUES ('Acme Fictive')")
        ins("INSERT INTO contacts (name) VALUES ('bob Test')")
        ins("INSERT INTO contacts (name) VALUES ('Alice Test')")
        ins("INSERT INTO applications (company_id, title) VALUES (?, 'Poste A')", self.acme)
        ins("INSERT INTO applications (company_id, title) VALUES (?, 'Poste Z')", zeta)

    def test_listes_de_noms_triees_sans_casse(self):
        self.assertEqual([c["name"] for c in list_companies(self.db)], ["Acme Fictive", "zeta Fictive"])
        self.assertEqual([c["name"] for c in list_contacts(self.db)], ["Alice Test", "bob Test"])

    def test_list_applications_filtre_par_entreprise(self):
        self.assertEqual(len(list_applications(self.db)), 2)
        self.assertEqual([a["title"] for a in list_applications(self.db, company_id=self.acme)], ["Poste A"])


if __name__ == "__main__":
    unittest.main()
