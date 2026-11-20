import os
import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sector TEXT,
  city TEXT,
  website TEXT,
  size TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  source TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'stage' CHECK (kind IN ('stage','alternance','cdi','cdd','autre')),
  url TEXT,
  status TEXT NOT NULL DEFAULT 'a_postuler' CHECK (status IN ('a_postuler','envoyee','relancee','entretien','offre','refus','sans_reponse')),
  applied_on TEXT,
  next_action TEXT,
  next_action_on TEXT,
  cv_version TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  happened_on TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'mail' CHECK (kind IN ('mail','appel','entretien','salon','autre')),
  summary TEXT
);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_id);
CREATE INDEX IF NOT EXISTS idx_interactions_application ON interactions(application_id, happened_on);
CREATE INDEX IF NOT EXISTS idx_interactions_contact ON interactions(contact_id, happened_on);
"""


def connect(path=None):
    """Ouvre une connexion (une par requête, à fermer par l'appelant)."""
    path = path or os.environ.get("DB_PATH") or "./data/work-tracking.db"
    if path != ":memory:":
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    # check_same_thread=False : FastAPI ouvre et ferme la connexion dans des threads différents.
    db = sqlite3.connect(path, check_same_thread=False)
    db.row_factory = sqlite3.Row
    # foreign_keys est propre à la connexion : sans lui, les ON DELETE CASCADE ne s'appliquent pas.
    db.execute("PRAGMA foreign_keys = ON")
    db.execute("PRAGMA journal_mode = WAL")
    db.executescript(SCHEMA)
    return db
