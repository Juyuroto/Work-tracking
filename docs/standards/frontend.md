# Norme frontend — Work-tracking

- Projet : Work-tracking, outil privé de suivi de candidatures de stage.
- Date : 2026-11-20
- Norme globale de référence : `~/.claude/knowledge/front/norme-globale.md` (Next.js 16, React 19.2)
- Statut : validée par Alain le 2026-11-20 (arbitrages au journal).
- Profil : **perso**. Un seul utilisateur, VM du homelab, HTTP, protégé par pfSense/VPN. Écart accepté : aucune authentification.
- Stack : `frontend/` Next.js 16.4.6 (App Router), React 19.3.1, JavaScript (`.jsx`, alias `@/` via `jsconfig.json`). Seules dépendances de dev : `eslint` et `eslint-config-next`. Backend FastAPI séparé (`backend/`, tests unittest, validation dans `validate.py`).
- Build : mode par défaut (`next build` + `next start`), pas de `standalone` ni d'`export`. Dockerfile à un seul `FROM`.
- Objectifs : code vraiment simple, zéro dépendance superflue.
- Hors périmètre : restes de migration (`src/lib/{db,data,stats,validate}.js`, `src/lib/*.test.js`, `.restes-migration/`, `src/` racine), supprimés à la main par Alain.

## 0. Application
Défaut conservé. Socle (§ 6, 7, RGPD du § 9, 12) non affaibli ; les écarts au socle sont listés en fin de document.

## 1. Avant d'écrire du code
Défaut conservé. Mode de build = défaut Next ; `app/` seul, pas de `pages/`.

## 2. Architecture et organisation
- Adapté : organisation par domaine dans `src/components/{ui,layout,candidatures,contacts,entreprises,interactions,dashboard}/` au lieu de `features/` parce que c'est l'existant et que déplacer n'apporte rien à un projet de cette taille.
- Défaut conservé : `app/` = routing seul, pages fines, `lib/` pour `api.js`, `labels.js`, `format.js`, `ui/` pour le générique.
- Adapté : CSS dans `src/assets/css/` (un fichier par composant + `variables.css` + `global.css`) parce que c'est l'existant.
- Adapté : pas d'`index` d'API publique par domaine ; un composant d'un domaine n'importe pas un autre domaine (sauf `ui/` et `layout/`) parce qu'un barrel est superflu.
- N/A : monorepo/packages partagés (une seule app).

## 3. Rendu et composants
- Défaut conservé : Server Components par défaut. Clients autorisés : `FormShell`, `DeleteButton`, `Nav`, `ScrollToTop`, `PageFade`, `KanbanBoard`, `error.jsx`. Tout nouveau `"use client"` se justifie (état, effet, API navigateur).
- Adapté : rendu 100 % dynamique (`export const dynamic = 'force-dynamic'` dans `layout.jsx`, `cache: 'no-store'` dans `api.js`) parce que les données changent à chaque action et qu'il n'y a pas de page publique. Pas de `"use cache"`.
- Adapté : `experimental.staleTimes.dynamic: 30` conservé parce que les server actions invalident via `revalidatePath('/', 'layout')`.
- Écarté : React Compiler et `<Suspense>`/streaming parce que pages rapides, un seul utilisateur, pas de gain mesuré ; pas de `useMemo`/`useCallback`/`memo` manuels (aucun aujourd'hui).
- Écarté : composants headless (Radix, React Aria) parce que zéro dépendance ; éléments HTML natifs (`select`, `button`, `form`).

## 4. État et données
- Défaut conservé : un outil par catégorie : local `useState`/`useActionState`, serveur = RSC + `fetch`, formulaires = Server Actions. Pas de store global.
- Défaut conservé : tout `fetch` vers le backend passe par `src/lib/api.js` (`API_URL`, headers, erreurs). Aucun composant n'appelle `fetch`.
- Adapté : pas de Zod ; la validation des entrées est faite par le backend (`validate.py`), qui renvoie un message FR affiché par `actions.js` parce qu'une seule source de vérité évite le doublon et zéro dépendance. Réponses API et `API_URL` non validées côté front (backend de confiance, même Compose).
- Écarté : TanStack Query / SWR / React Hook Form parce que RSC + Server Actions suffisent.

## 5. Code
- Adapté : **JavaScript** au lieu de TypeScript strict (décision d'Alain : simplicité, zéro dépendance) ; pas de Zod. Pas de typecheck.
- Défaut conservé : nommage (PascalCase composants, camelCase, `handleX`, `onX`), imports `@/`, routes en kebab-case français (`entreprises`, `candidatures`).
- Adapté : lint = ESLint 9 en flat config (`frontend/eslint.config.mjs`, `eslint-config-next/core-web-vitals`), script `npm run lint`. `eslint-config-next` embarque déjà `jsx-a11y` : pas de plugin ajouté. Pas de Prettier/Biome ; style = existant, commentaires « pourquoi » seulement.
- Défaut conservé : Conventional Commits.

## 6. Sécurité (socle)
- Défaut conservé : aucun secret côté client ; aucune variable `NEXT_PUBLIC_` ; `API_URL` lue côté serveur seulement ; pas de `dangerouslySetInnerHTML`, `eval`, `localStorage`.
- Adapté : paquet `server-only` écarté (décision d'Alain) ; protection par convention : `lib/api.js` n'est importé que par `actions.js` et les pages serveur (vérifier à chaque ajout). Revoir si un composant client a besoin d'un helper de `lib/`.
- Écarté (écart accepté par Alain, plus faible que le socle) : authentification/droits dans les Server Actions, cookies de session, parce qu'outil mono-utilisateur derrière pfSense/VPN. Condition : l'app n'est jamais exposée hors VPN.
- Adapté : en-têtes posés dans `next.config.mjs` : `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `Permissions-Policy`, CSP en production (`default-src 'self'`, `frame-ancestors 'none'`, `form-action 'self'`). `poweredByHeader: false`.
- Adapté : CSP avec `'unsafe-inline'` (script et style) au lieu d'un nonce parce que Next injecte des scripts inline et le nonce impose `proxy.ts` ; écart assumé par Alain (aucun contenu utilisateur rendu en HTML ; `force-dynamic` actif donc nonce possible plus tard). Écart au socle « CSP stricte », inscrit en fin de document.
- Défaut conservé : `lib/api.js` pose un timeout de 10 s sur chaque `fetch` (`AbortSignal.timeout`). Effet de bord documenté par Next : un `signal` désactive la mémoïsation des GET identiques dans un même rendu ; sans gravité ici (mono-utilisateur, pages rapides).
- Défaut conservé : `DeleteButton` affiche l'erreur de `remove()` dans un `role="alert"` (même mécanique que `FormShell`).
- Défaut conservé : toute Server Action capture les erreurs de l'API via `toError` (`save`, `remove`, `setApplicationStatus`).
- Adapté : HSTS absent parce que le service est en HTTP ; à ajouter si HTTPS un jour.
- Défaut conservé : `error.jsx` sans détail interne ; `actions.js` renvoie `GENERIC_ERROR` pour les erreurs 5xx et logue côté serveur.

## 7. Accessibilité (socle)
- Défaut conservé : WCAG 2.2 AA. Existant : `lang="fr"`, lien d'évitement, `<main id="contenu">`, `label`/`htmlFor` via `Field`, erreurs de formulaire en `role="alert"`, statut `role="status"`, `:focus-visible`, cibles tactiles `--size-touch` 2,75 rem, `prefers-reduced-motion`, contrastes AA calculés (clair et sombre).
- Défaut conservé : tout nouveau composant respecte ces points ; pas de test axe automatisé (voir § 10).
- N/A : collage/gestionnaires de mots de passe (pas d'authentification).

## 8. Performance
- Défaut conservé : minimum de JS client, objectifs CWV indicatifs.
- N/A : `next/image` et `next/font` (aucune image raster ni police web ; icône SVG, police système) ; à utiliser si l'un d'eux apparaît.
- Écarté : `next/dynamic` tant que le JS client reste léger.

## 9. RGPD, SEO, i18n
- Défaut conservé (socle) : aucun cookie, aucun traceur, aucun script tiers ; donc pas de bandeau. Les données personnelles (contacts) restent sur le homelab, sans transfert externe.
- Adapté : `robots: { index: false, follow: false }` dans `layout.jsx` (site privé) ; pas de `sitemap.ts` ni de `robots.ts` (aucune page publique). Ajouter un `robots.txt` `Disallow: /` reste optionnel.
- Défaut conservé : dates via `Intl.DateTimeFormat('fr-FR')` (`lib/format.js`).
- Écarté : fichiers de messages/i18n parce que monolingue FR ; libellés dans `lib/labels.js`.

## 10. Tests
- Écarté : Vitest, Testing Library, MSW, Playwright, axe parce que dépendances ; la validation et la logique métier sont testées côté `backend/` (unittest).
- Adapté : logique pure du front (`lib/format.js`, `lib/labels.js`) testée avec `node --test` (natif, sans dépendance), fichiers dans `frontend/tests/*.test.js`, lancés par `npm test` (glob, pas de dossier : `node --test <dossier>/` plante sur Node 22). `lib/` n'importe rien de non relatif ; tout import relatif entre modules de `lib/` garde l'extension `.js`. Parcours critiques vérifiés à la main + `next build`.
- Défaut conservé : toute nouvelle logique backend arrive avec ses tests.

## 11. Docker et build
- Adapté : mode par défaut (`next start`) au lieu de `standalone` parce que Alain l'a retiré volontairement (Dockerfile à un seul `FROM`, simplicité). Un seul mode de build.
- Défaut conservé : utilisateur non-root (`USER node`), `cap_drop: [ALL]`, `no-new-privileges`, `.dockerignore` (`.env*`, `node_modules`, `.next`), `.gitignore` racine couvre `.env*`, `node_modules`, `.next`.
- Défaut conservé : `API_URL` lue à l'exécution (pas `NEXT_PUBLIC_`).

## 12. Avant de rendre son travail (socle)
- Adapté : pas de typecheck (JS) ; obligatoires : `cd frontend && npm run lint`, `npm test`, `npm run build` OK, tests backend OK si le backend est touché, checklist ci-dessous, liste des règles non respectées avec la raison.

## Checklist vérifiable
- [ ] `cd frontend && npm run lint` sans erreur.
- [ ] `cd frontend && npm test` passe (`node --test`).
- [ ] `cd frontend && npm run build` passe sans erreur ni avertissement.
- [ ] `package.json` : aucune dépendance hors `next`, `react`, `react-dom` ; dev : `eslint`, `eslint-config-next` seulement.
- [ ] Toute Server Action (`actions.js`) passe par `toError` ; `fetch` de `api.js` avec `signal: AbortSignal.timeout`.
- [ ] `grep -rn "fetch(" frontend/src` : seulement `lib/api.js`.
- [ ] `grep -rnE "NEXT_PUBLIC|dangerouslySetInnerHTML|eval\(|localStorage" frontend/src` : aucun résultat.
- [ ] `grep -rn "use client" frontend/src` : seulement les composants listés au § 3 (ou justifiés).
- [ ] `lib/api.js` jamais importé depuis un fichier `use client`.
- [ ] Aucun `.env`, IP ou hostname réel dans le dépôt (hors plage privée générique documentée).
- [ ] Chaque champ a un `label` ; erreurs en `role="alert"` ; `:focus-visible` conservé ; cibles ≥ `--size-touch` ; contraste AA clair et sombre.
- [ ] `robots: { index: false }` toujours dans `layout.jsx` ; aucun cookie ni script tiers.
- [ ] En-têtes de `next.config.mjs` présents (`curl -I` sur la prod locale).
- [ ] Nouveau code front conforme au style existant (composants par domaine, CSS dans `assets/css/`).
- [ ] Tests backend (`unittest`) OK si le backend a changé.

## Écarts connus au socle (acceptés ou à traiter)
1. Pas d'authentification (§ 6) : accepté par Alain.
2. CSP avec `'unsafe-inline'` (§ 6) : voir § 6.
3. HSTS absent (§ 6) : HTTP seulement.
4. Tests front limités à `lib/format.js` et `lib/labels.js` (§ 10) : pas de test de composants ni d'axe.

## Journal des décisions
| Date | Décision | Raison |
|---|---|---|
| 2026-11-20 | Proposition initiale de la norme (profil perso) | Pas de norme projet existante (§ 0.2) |
| 2026-11-20 | Organisation par domaine dans `components/`, pas de `features/` | Existant |
| 2026-11-20 | Pas de Zod : validation dans le backend | Source de vérité unique |
| 2026-11-20 | Pas d'authentification | Écart accepté : mono-utilisateur derrière VPN |
| 2026-11-20 | Mode de build par défaut, pas de `standalone` | Choix d'Alain : Dockerfile simple |
| 2026-11-20 | Proposition validée par Alain | — |
| 2026-11-20 | ESLint + `eslint-config-next` en devDependencies, `node --test` pour les tests | Seules dépendances ajoutées ; jsx-a11y déjà inclus ; pas de Vitest/Playwright |
| 2026-11-20 | JS confirmé ; pas de Zod ; pas de `server-only` | Simplicité, convention suffisante |
| 2026-11-20 | CSP avec `'unsafe-inline'` conservée | Écart assumé |
| 2026-11-20 | `remove()`/`delete*` via `toError` ; timeout 10 s sur `fetch` | Cohérence des erreurs ; backend injoignable ne bloque plus |
| 2026-11-20 | `DeleteButton` en `useActionState` (`role="alert"`, `.alert`), `delete*` en `(prevState, formData)` | L'erreur de suppression s'affiche au lieu d'être perdue |
| 2026-11-20 | `Nav.jsx` : `pendingHref` stocké avec son `pathname` de départ, remis à null pendant le rendu s'il est périmé (plus d'effet) | Lint `set-state-in-effect` ; garde le trait réactif au clic |
