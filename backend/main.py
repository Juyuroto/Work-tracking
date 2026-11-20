import sqlite3
from datetime import date
from typing import Any

from fastapi import Body, Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

import data
from db import connect
from stats import get_dashboard
from validate import (
    APPLICATION_KINDS,
    APPLICATION_STATUSES,
    INTERACTION_KINDS,
    ValidationError,
    optional_id,
    valid_choice,
    valid_date,
    valid_email,
    valid_id,
    valid_text,
    valid_url,
)

app = FastAPI()


def error(status, detail):
    return JSONResponse({"detail": detail}, status_code=status)


@app.exception_handler(ValidationError)
def on_validation_error(request: Request, e: ValidationError):
    return error(400, str(e))


@app.exception_handler(sqlite3.IntegrityError)
def on_integrity_error(request: Request, e: sqlite3.IntegrityError):
    if "UNIQUE" in str(e):
        return error(409, "Une entreprise porte déjà ce nom.")
    if "FOREIGN KEY" in str(e):
        return error(400, "Élément lié introuvable.")
    return error(400, "Données invalides.")


def get_db():
    db = connect()
    try:
        yield db
    finally:
        db.close()


def path_id(value: str):
    """Id de chemin : tout ce qui n'est pas un id valide est un élément absent (404)."""
    try:
        return valid_id(value)
    except ValidationError:
        raise HTTPException(404, "Élément introuvable.") from None


def found(row):
    if row is None:
        raise HTTPException(404, "Élément introuvable.")
    return row


# Insère (id None) ou met à jour ; `fields` = { colonne: valeur }. Les noms de table et de colonnes
# viennent du code, jamais de la requête. Commit avant de répondre.
def upsert(db, table, id, fields, *, touch=False):
    cols = list(fields)
    values = list(fields.values())
    with db:
        if id is None:
            marks = ", ".join("?" * len(cols))
            return db.execute(f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({marks})", values).lastrowid
        extra = ", updated_at = datetime('now')" if touch else ""
        sets = ", ".join(f"{c} = ?" for c in cols) + extra
        if not db.execute(f"UPDATE {table} SET {sets} WHERE id = ?", [*values, id]).rowcount:
            raise HTTPException(404, "Élément introuvable.")
        return id


# Supprimer un élément déjà absent n'est pas une erreur (double clic sur « Supprimer »).
def remove(db, sql, id):
    with db:
        db.execute(sql, (id,))


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/dashboard")
def dashboard(db=Depends(get_db)):
    return get_dashboard(db)


# --- Entreprises

def company_fields(b):
    return {
        "name": valid_text(b.get("name"), "Nom", 200, required=True),
        "sector": valid_text(b.get("sector"), "Secteur", 200),
        "city": valid_text(b.get("city"), "Ville", 200),
        "website": valid_url(b.get("website"), "Site web"),
        "size": valid_text(b.get("size"), "Taille", 100),
        "notes": valid_text(b.get("notes"), "Notes", 5000),
    }


@app.get("/companies")
def list_companies(db=Depends(get_db)):
    return data.list_companies(db)


@app.post("/companies", status_code=201)
def create_company(body: dict[str, Any] = Body(), db=Depends(get_db)):
    return {"id": upsert(db, "companies", None, company_fields(body))}


@app.get("/companies/{id}")
def get_company(id: str, db=Depends(get_db)):
    return found(data.get_company(db, path_id(id)))


@app.put("/companies/{id}")
def update_company(id: str, body: dict[str, Any] = Body(), db=Depends(get_db)):
    return {"id": upsert(db, "companies", path_id(id), company_fields(body))}


@app.delete("/companies/{id}", status_code=204)
def delete_company(id: str, db=Depends(get_db)):
    remove(db, "DELETE FROM companies WHERE id = ?", path_id(id))


# --- Contacts

def contact_fields(b):
    return {
        "company_id": optional_id(b.get("company_id"), "Entreprise"),
        "name": valid_text(b.get("name"), "Nom", 200, required=True),
        "role": valid_text(b.get("role"), "Poste", 200),
        "email": valid_email(b.get("email")),
        "phone": valid_text(b.get("phone"), "Téléphone", 50),
        "linkedin": valid_url(b.get("linkedin"), "LinkedIn"),
        "source": valid_text(b.get("source"), "Source", 200),
        "notes": valid_text(b.get("notes"), "Notes", 5000),
    }


@app.get("/contacts")
def list_contacts(db=Depends(get_db)):
    return data.list_contacts(db)


@app.post("/contacts", status_code=201)
def create_contact(body: dict[str, Any] = Body(), db=Depends(get_db)):
    return {"id": upsert(db, "contacts", None, contact_fields(body))}


@app.get("/contacts/{id}")
def get_contact(id: str, db=Depends(get_db)):
    return found(data.get_contact(db, path_id(id)))


@app.put("/contacts/{id}")
def update_contact(id: str, body: dict[str, Any] = Body(), db=Depends(get_db)):
    return {"id": upsert(db, "contacts", path_id(id), contact_fields(body))}


@app.delete("/contacts/{id}", status_code=204)
def delete_contact(id: str, db=Depends(get_db)):
    id = path_id(id)
    with db:  # une seule transaction : échanges orphelins puis contact
        db.execute("DELETE FROM interactions WHERE contact_id = ? AND application_id IS NULL", (id,))
        db.execute("DELETE FROM contacts WHERE id = ?", (id,))


# --- Candidatures

# Statut autre que « à postuler » sans date d'envoi : on prend aujourd'hui (relances J+7, graphique).
def applied_on(b):
    d = valid_date(b.get("applied_on"), "Date d’envoi")
    return d or (None if b.get("status") == "a_postuler" else date.today().isoformat())


def application_fields(b):
    return {
        "company_id": valid_id(b.get("company_id"), "Entreprise"),
        "title": valid_text(b.get("title"), "Intitulé", 200, required=True),
        "kind": valid_choice(b.get("kind"), APPLICATION_KINDS, "Type"),
        "url": valid_url(b.get("url"), "Lien de l’offre"),
        "status": valid_choice(b.get("status"), APPLICATION_STATUSES, "Statut"),
        "applied_on": applied_on(b),
        "next_action": valid_text(b.get("next_action"), "Prochaine action", 200),
        "next_action_on": valid_date(b.get("next_action_on"), "Date de prochaine action"),
        "cv_version": valid_text(b.get("cv_version"), "Version du CV", 100),
        "notes": valid_text(b.get("notes"), "Notes", 5000),
    }


@app.get("/applications")
def list_applications(status: str | None = None, db=Depends(get_db)):
    return data.list_applications(db, status=status)


@app.post("/applications", status_code=201)
def create_application(body: dict[str, Any] = Body(), db=Depends(get_db)):
    return {"id": upsert(db, "applications", None, application_fields(body), touch=True)}


@app.get("/applications/{id}")
def get_application(id: str, db=Depends(get_db)):
    return found(data.get_application(db, path_id(id)))


@app.put("/applications/{id}")
def update_application(id: str, body: dict[str, Any] = Body(), db=Depends(get_db)):
    return {"id": upsert(db, "applications", path_id(id), application_fields(body), touch=True)}


@app.patch("/applications/{id}/status")
def set_application_status(id: str, body: dict[str, Any] = Body(), db=Depends(get_db)):
    status = valid_choice(body.get("status"), APPLICATION_STATUSES, "Statut")
    app_id = path_id(id)
    with db:
        changed = db.execute(
            "UPDATE applications SET status = ?, applied_on = COALESCE(applied_on, ?), updated_at = datetime('now') WHERE id = ?",
            (status, None if status == "a_postuler" else date.today().isoformat(), app_id),
        ).rowcount
    if not changed:
        raise HTTPException(404, "Élément introuvable.")
    return {"id": app_id}


@app.delete("/applications/{id}", status_code=204)
def delete_application(id: str, db=Depends(get_db)):
    remove(db, "DELETE FROM applications WHERE id = ?", path_id(id))


# --- Échanges

@app.post("/interactions", status_code=201)
def create_interaction(body: dict[str, Any] = Body(), db=Depends(get_db)):
    application_id = optional_id(body.get("application_id"), "Candidature")
    contact_id = optional_id(body.get("contact_id"), "Contact")
    if application_id is None and contact_id is None:
        raise ValidationError("Échange : choisissez une candidature ou un contact.")
    fields = {
        "application_id": application_id,
        "contact_id": contact_id,
        "happened_on": valid_date(body.get("happened_on"), "Date", required=True),
        "kind": valid_choice(body.get("kind"), INTERACTION_KINDS, "Type"),
        "summary": valid_text(body.get("summary"), "Résumé", 2000),
    }
    return {"id": upsert(db, "interactions", None, fields)}


@app.delete("/interactions/{id}", status_code=204)
def delete_interaction(id: str, db=Depends(get_db)):
    remove(db, "DELETE FROM interactions WHERE id = ?", path_id(id))
