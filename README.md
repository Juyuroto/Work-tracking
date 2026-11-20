# Work-tracking

## Structure
- `backend/` : API FastAPI (Python) et SQLite. Lectures, écritures, validation, dashboard. Tests : `cd backend && python3 -m unittest`.
- `frontend/` : app Next.js (pages, formulaires). Elle appelle le backend côté serveur via `API_URL`, sans jamais toucher à la base.
- Chaque dossier a son `Dockerfile` (production) et son `Dockerfile.dev` (développement).
- `compose.yml` à la racine : `docker compose up` se lance depuis la racine.

## Déploiement
Pré-requis : Docker avec Compose, et un `.env` à la racine (non versionné, modèle : `.env.example`) avec `BIND_ADDR=<IP de l'interface d'écoute>`. Sans lui, le port n'écoute que sur `127.0.0.1`.

1. `docker compose up -d --build`
   - Premier déploiement après le passage à deux services : `docker compose up -d --build --remove-orphans`, sinon l'ancien conteneur `app` garde le port 3000. Les données sont reprises (même volume `app_data`).
2. Accès : `http://<BIND_ADDR>:3000`.

Seul le front est publié (port 3000, sur l'interface `BIND_ADDR` uniquement). Le backend n'écoute que sur le réseau interne de Compose.

**Écart accepté aux normes sécu** : HTTP en clair et aucune authentification.
- Quiconque atteint le port 3000 peut lire, modifier et supprimer toutes les données.
- Seule protection : la règle pfSense, qui doit n'autoriser vers ce port que le sous-réseau du VPN.
- Si la VM partage son VLAN avec d'autres machines, pfSense ne filtre pas ce trafic. Il faut alors un VLAN dédié ou un filtrage dans la chaîne `DOCKER-USER`.

Les en-têtes de sécurité (CSP, `X-Frame-Options`…) sont posés par Next, dans `frontend/next.config.mjs`.

## Développement (rechargement à chaud)
`docker compose -f compose.dev.yml up` lance `next dev` (port 3000) et `uvicorn --reload`.
- Premier lancement après le passage à deux services : ajouter `--remove-orphans` (l'ancien conteneur `app` garde le port 3000).
- Toute modification d'un fichier de `frontend/` ou de `backend/` est prise en compte tout de suite, sans build.
- Il remplace les conteneurs normaux et garde la même base de données.
- Pour revenir à la version optimisée : `docker compose up -d --build`.
- Le front lance `npm install` à chaque démarrage : presque rien à faire si les dépendances n'ont pas changé.
  - Sinon, l'installation dure plus longtemps et rien n'est servi pendant ce temps : attendre `✓ Ready` dans `docker compose -f compose.dev.yml logs -f frontend`.
- Écoute sur `127.0.0.1` par défaut. Pour y accéder depuis une autre machine : `BIND_ADDR=0.0.0.0` (ou l'IP du PC), et une IP en `192.168.x.x` (`allowedDevOrigins` dans `frontend/next.config.mjs` ; pour un autre réseau, ajoute sa plage à cette liste).
- Après un changement de dépendances :
  - front : `docker compose -f compose.dev.yml restart frontend` (réinstallation automatique) ;
  - backend (`requirements.txt`) ou modification d'un `Dockerfile.dev` : `docker compose -f compose.dev.yml up --build`.

## Sauvegarde
Copie à chaud cohérente (`VACUUM INTO`), puis sortie du volume :
```sh
F=work-tracking-$(date +%F).db
docker compose exec -T backend python -c \
  "import os, sqlite3; sqlite3.connect(os.environ['DB_PATH']).execute(\"VACUUM INTO '/tmp/$F'\")"
mkdir -p ~/sauvegardes && docker compose cp backend:/tmp/$F ~/sauvegardes/$F
docker compose exec -T backend rm /tmp/$F
```
Les sauvegardes restent hors du dépôt (`~/sauvegardes`). Si la copie quitte la VM, la chiffrer d'abord (`age -p` ou `gpg -c`).

## Mise à jour
Reconstruire au moins chaque mois (et à chaque CVE critique) pour récupérer les correctifs des images de base :
`docker compose build --pull --no-cache && docker compose up -d`

Mettre aussi à jour périodiquement :
- les tags `node` (`frontend/Dockerfile*`) et `python` (`backend/Dockerfile*`) ;
- côté npm (`cd frontend`) : `npm audit --omit=dev` et `npm outdated`, puis mettre à jour `next` (et `react`, `react-dom`) si besoin ;
- côté Python (`backend/requirements.txt`, versions figées) :
  1. dans un venv : `pip install -U fastapi uvicorn` ;
  2. `pip freeze > requirements.txt` ;
  3. relancer les tests.
