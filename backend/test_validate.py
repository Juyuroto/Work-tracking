import unittest

from validate import (
    APPLICATION_STATUSES, ValidationError, optional_id, valid_choice, valid_date, valid_id, valid_text, valid_url,
)


class TestValidate(unittest.TestCase):
    def rejects(self, fn, *args, **kw):
        with self.assertRaises(ValidationError):
            fn(*args, **kw)

    def test_valid_url(self):
        self.assertEqual(valid_url("https://example.com/a?b=1", "Lien"), "https://example.com/a?b=1")
        self.assertEqual(valid_url("http://example.com", "Lien"), "http://example.com")
        self.assertIsNone(valid_url("  ", "Lien"))
        for bad in ["javascript:alert(1)", "JaVaScript:alert(1)", "data:text/html,<b>x</b>", "example.com", "ftp://example.com"]:
            with self.subTest(bad=bad):
                self.rejects(valid_url, bad, "Lien")

    def test_valid_date(self):
        self.assertEqual(valid_date("2026-02-28", "Date"), "2026-02-28")
        self.assertIsNone(valid_date("", "Date"))
        for bad in ["2026-02-30", "20/11/2026", "2026-13-01", "2026-1-1", "abc"]:
            with self.subTest(bad=bad):
                self.rejects(valid_date, bad, "Date")
        self.rejects(valid_date, "", "Date", required=True)

    def test_valid_choice(self):
        self.assertEqual(valid_choice("envoyee", APPLICATION_STATUSES, "Statut"), "envoyee")
        self.rejects(valid_choice, "inconnu", APPLICATION_STATUSES, "Statut")
        self.rejects(valid_choice, None, APPLICATION_STATUSES, "Statut")

    def test_valid_id(self):
        self.assertEqual(valid_id("12"), 12)
        self.assertEqual(valid_id(7), 7)
        for bad in [0, "0", -1, "-3", "abc", "1.5", "1e3", "", None]:
            with self.subTest(bad=bad):
                self.rejects(valid_id, bad)
        self.assertIsNone(optional_id("", "Id"))
        self.rejects(optional_id, "abc", "Id")

    def test_valid_text(self):
        self.assertEqual(valid_text("  salut ", "Texte"), "salut")
        self.assertIsNone(valid_text("   ", "Texte"))
        self.assertEqual(valid_text("a" * 200, "Texte"), "a" * 200)
        self.rejects(valid_text, "a" * 201, "Texte")
        self.rejects(valid_text, "a" * 11, "Texte", 10)
        self.rejects(valid_text, "", "Texte", 10, required=True)


if __name__ == "__main__":
    unittest.main()
