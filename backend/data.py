LAST_INTERACTION = "(SELECT MAX(happened_on) FROM interactions WHERE contact_id = c.id)"
APPLICATION_COLUMNS = """a.id, a.title, a.kind, a.status, a.applied_on, a.next_action,
  a.next_action_on, co.name AS company_name"""
CONTACT_SELECT = f"""SELECT c.id, c.name, c.role, c.email, c.phone, c.linkedin, c.source, c.notes,
  c.company_id, co.name AS company_name, {LAST_INTERACTION} AS last_interaction_on
  FROM contacts c LEFT JOIN companies co ON co.id = c.company_id"""


def query_all(db, sql, params=()):
    return [dict(r) for r in db.execute(sql, params).fetchall()]


def query_one(db, sql, params=()):
    r = db.execute(sql, params).fetchone()
    return dict(r) if r else None


def list_companies(db):
    return query_all(
        db,
        """
    SELECT co.id, co.name, co.sector, co.city,
      (SELECT COUNT(*) FROM applications WHERE company_id = co.id) AS applications_count,
      (SELECT COUNT(*) FROM contacts WHERE company_id = co.id) AS contacts_count
    FROM companies co ORDER BY co.name COLLATE NOCASE""",
    )


def get_company(db, id):
    company = query_one(db, "SELECT * FROM companies WHERE id = ?", (id,))
    if not company:
        return None
    company["contacts"] = query_all(
        db, f"{CONTACT_SELECT} WHERE c.company_id = ? ORDER BY c.name COLLATE NOCASE", (id,)
    )
    company["applications"] = list_applications(db, company_id=id)
    return company


def list_contacts(db):
    return query_all(db, f"{CONTACT_SELECT} ORDER BY c.name COLLATE NOCASE")


def get_contact(db, id):
    contact = query_one(db, f"{CONTACT_SELECT} WHERE c.id = ?", (id,))
    if not contact:
        return None
    contact["interactions"] = list_interactions(db, contact_id=id)
    return contact


def list_applications(db, status=None, company_id=None):
    where = []
    params = []
    if status:
        where.append("a.status = ?")
        params.append(status)
    if company_id is not None:
        where.append("a.company_id = ?")
        params.append(company_id)
    clause = f"WHERE {' AND '.join(where)}" if where else ""
    return query_all(
        db,
        f"""SELECT {APPLICATION_COLUMNS} FROM applications a JOIN companies co ON co.id = a.company_id
     {clause} ORDER BY a.updated_at DESC, a.id DESC""",
        params,
    )


def get_application(db, id):
    application = query_one(
        db,
        """SELECT a.*, co.name AS company_name FROM applications a JOIN companies co ON co.id = a.company_id
     WHERE a.id = ?""",
        (id,),
    )
    if not application:
        return None
    application["interactions"] = list_interactions(db, application_id=id)
    return application


# Forme : { id, happened_on, kind, summary, application_id, application_title, contact_id, contact_name }
def list_interactions(db, application_id=None, contact_id=None):
    where = []
    params = []
    if application_id is not None:
        where.append("i.application_id = ?")
        params.append(application_id)
    if contact_id is not None:
        where.append("i.contact_id = ?")
        params.append(contact_id)
    clause = f"WHERE {' AND '.join(where)}" if where else ""
    return query_all(
        db,
        f"""SELECT i.id, i.happened_on, i.kind, i.summary, i.application_id, a.title AS application_title,
       i.contact_id, c.name AS contact_name
     FROM interactions i
     LEFT JOIN applications a ON a.id = i.application_id
     LEFT JOIN contacts c ON c.id = i.contact_id
     {clause}
     ORDER BY i.happened_on DESC, i.id DESC""",
        params,
    )
