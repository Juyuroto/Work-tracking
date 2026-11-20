import re
from datetime import date
from urllib.parse import urlsplit

APPLICATION_STATUSES = ("a_postuler", "envoyee", "relancee", "entretien", "offre", "refus", "sans_reponse")
APPLICATION_KINDS = ("stage", "alternance", "cdi", "cdd", "autre")
INTERACTION_KINDS = ("mail", "appel", "entretien", "salon", "autre")

MAX_ID = 2**53 - 1


class ValidationError(Exception):
    pass


def _fail(message):
    raise ValidationError(message)


def _clean(value, label, required):
    """Chaîne trimée ; vide → None (ou erreur si required)."""
    s = value.strip() if isinstance(value, str) else ""
    if not s and required:
        _fail(f"{label} : champ obligatoire.")
    return s or None


def valid_id(value, label="Identifiant"):
    s = value.strip() if isinstance(value, str) else ("" if value is None else str(value))
    if not re.fullmatch(r"[1-9][0-9]{0,15}", s) or int(s) > MAX_ID:
        _fail(f"{label} : identifiant invalide.")
    return int(s)


def optional_id(value, label):
    return None if _clean(value, label, False) is None else valid_id(value, label)


def valid_text(value, label, max_len=200, *, required=False):
    s = _clean(value, label, required)
    if s is not None and len(s) > max_len:
        _fail(f"{label} : {max_len} caractères maximum.")
    return s


def valid_date(value, label, *, required=False):
    s = _clean(value, label, required)
    if s is None:
        return None
    try:
        if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", s):
            raise ValueError
        date.fromisoformat(s)
    except ValueError:
        _fail(f"{label} : date invalide (AAAA-MM-JJ).")
    return s


def valid_url(value, label):
    s = valid_text(value, label, 500)
    if s is None:
        return None
    try:
        u = urlsplit(s)
    except ValueError:
        _fail(f"{label} : lien invalide.")
    if not u.scheme:
        _fail(f"{label} : lien invalide.")
    if u.scheme not in ("http", "https"):
        _fail(f"{label} : lien http(s) uniquement.")
    if not u.netloc or re.search(r"\s", u.netloc):
        _fail(f"{label} : lien invalide.")
    return s


def valid_email(value, label="E-mail"):
    s = valid_text(value, label, 200)
    if s is not None and not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", s):
        _fail(f"{label} : adresse invalide.")
    return s


def valid_choice(value, allowed, label):
    if value not in allowed:
        _fail(f"{label} : valeur non autorisée.")
    return value
