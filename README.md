# QASH Site

Site officiel de QASH, solution de gestion de boutique et de caisse pour les commerçants. Application React + Vite + TypeScript, avec Supabase pour l'authentification et les données.

## Démarrage

```bash
bun install
bun run dev
```

Le site est alors disponible sur http://localhost:3000.

## Build

```bash
bun run build
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` et renseigner :

- `VITE_SUPABASE_URL` : URL du projet Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY` : clé publique (publishable/anon) de Supabase.

Aucune clé secrète ne doit être ajoutée à ce dépôt.
