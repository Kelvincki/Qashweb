# QASH — site web (www.useqash.com)

QASH est la caisse des commerces de proximité : une application Android (vente, stock, bénéfice, équipe, cahier de dettes) qui marche sans internet et se synchronise ensuite. Ce dépôt contient **le site** : pages publiques, compte, « Mon espace » et paiement de l'abonnement. L'application Android est dans un autre dépôt.

React 19 + Vite + TypeScript + Tailwind v4, déployé sur Vercel. Backend : Supabase (projet afstcyjnzwaurkqmomnj). Gestionnaire de paquets : **bun** (`bun install`, `bun run dev`, `bun run lint`, `bun run build`).

## Public et ton
- Commerçants de Dakar et du Sénégal : boutiques, restaurants, pharmacies, quincailleries, mode, services.
- **Mobile d'abord** (téléphones Android, souvent d'entrée de gamme) et **connexions lentes** (3G/4G) : chaque kilo-octet compte.
- Langue : **français**. Ton simple, direct et chaleureux, phrases courtes, vocabulaire du comptoir (« encaisser », « stock », « cahier de dettes »). Typographie française : espace insécable avant `? ! : ;` (utiliser `nb()` de `src/lib/typo.ts`).

## Règles absolues
- **Présentation ≠ logique.** Une refonte visuelle ne touche ni à la logique d'authentification Supabase, ni à la logique d'abonnement, ni aux routes existantes, ni aux variables d'environnement.
- **Aucune clé, aucun secret** dans le code, le dépôt ou les journaux : pas de service_role, SenePay (X-Api-Key, X-Api-Secret, whsec_), Twilio, Mistral, Gemini. Côté client : seulement l'URL Supabase et la clé publique (publishable/anon). Ne jamais journaliser un mot de passe ou un jeton.
- **Le serveur est l'autorité.** Le site n'accorde jamais d'accès sur la seule base du client : pas de localStorage/sessionStorage/store_code ni de user_metadata pour décider des droits. Ne jamais désactiver RLS ; pas de filtre côté client comme substitut de sécurité.
- **Pas de faux contenu** : aucun faux témoignage, chiffre d'utilisateurs, logo de client ou de partenaire, avis, ni chiffre de vente inventé. Une information manquante devient un champ de configuration marqué `TODO`, jamais une invention.
- **Aucune promesse non tenue** : pas de « temps réel » ni d'« instantané » (dire « synchronisé », « Actualiser », « dès que vous êtes connecté à internet ») ; pas de « paiement confirmé » avant confirmation du serveur ; pas de faux bouton de paiement.
- **Jamais de prix d'achat, de bénéfice ni de données de vente sur le site** (ni dans « Mon espace »). Ces données restent dans l'application.
- **Coordonnées centralisées** dans `src/config/site.ts` (`SITE_URL`, `CONTACT_EMAIL`, `WHATSAPP_NUMBER`, `PLAY_STORE_URL`, `PAYMENTS_ENABLED`…) : aucun numéro, e-mail ou lien de store écrit en dur dans une page.
- Ne rien modifier hors du périmètre demandé ; lister les fichiers modifiés ; un commit par groupe de pages.

## Paiement (contrat `create-checkout`)
- Le paiement passe uniquement par l'Edge Function `create-checkout` (le site ne parle jamais directement à SenePay), et seulement si `PAYMENTS_ENABLED` vaut `true`. Sinon : « Paiement bientôt disponible », aucun bouton de paiement.
- `supabase.functions.invoke('create-checkout', { body })` avec la session de l'utilisateur.
  - `{ quote: true }` → `{ seats, monthly, paid_seats, employees, plans[], extend: { available, months_remaining, unit_price, max_seats, period_end } }`
  - `{ plan: '1m' | '12m' }` → renouvellement ; `{ extend: { seats: N } }` (1 à 20) → extension de places.
  - Réponse `{ checkoutUrl }` : lire `data?.checkoutUrl ?? data?.checkout_url`, puis `window.location.href = url`.
  - Erreurs en clair : 401 (reconnexion), 403 `only_owner_can_pay`, 409 `extend_requires_active_period`, 400 `invalid_seats`, 502/503 (réessayer plus tard).
- Tarifs publics : essai gratuit 3 jours ; 5 000 FCFA/mois pour le gérant + 3 500 FCFA/mois par employé ; abonnement 1 ou 12 mois ; 3 jours de grâce après l'échéance, puis lecture seule (données conservées). Aucune remise inventée : les montants facturés viennent du serveur (`quote`).
- Statuts calculés par la RPC `get_my_subscription()` : trial / active / grace / expired.
- `PaymentSuccessPage` : interroge `get_my_subscription` toutes les 3 s pendant 60 s max ; « confirmé » seulement après confirmation serveur ; pour une extension, `paid_seats` doit avoir augmenté par rapport à `qash_extend_before`.

## Redirection (`src/lib/redirect.ts`) — ne pas toucher
- Routes autorisées après connexion : `/pricing` et `/dashboard` uniquement.
- `consumeRedirect` reste idempotent (fenêtre de 5 s). Ne jamais le réécrire ni le simplifier.

## Authentification
- Lien de confirmation d'e-mail : `/bienvenue`. Réinitialisation : `/mot-de-passe-oublie` → `resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })` → `/reset-password` (`updateUser({ password })`, 8 caractères minimum).
- À déclarer dans Supabase (Authentication → URL Configuration → Redirect URLs) pour chaque domaine : `/auth/callback`, `/bienvenue`, `/reset-password`.

## Design (détails dans `docs/DESIGN.md`)
- Direction « Loud and flat » : affiche de rue, champs de couleur pleins, typographie très grasse, aucune ombre au repos, aucun dégradé, pas d'étiquette en petites capitales.
- Couleurs : rouge `#E8161F` (actions), jaune-orangé `#FFB000` (champs), noir `#18181B` (encre), blanc et gris `#F4F4F5` (fonds). Jamais de texte blanc sur jaune.
- Typographie : **Archivo** (variable, auto-hébergée via `@fontsource-variable/archivo`), une seule famille. Corps 18 px minimum.
- Logo : `public/brand/` (wordmark sur fond clair uniquement, Q seul pour les icônes). Ne pas redessiner ni déformer.
- Maquettes de téléphone : un seul composant `PhoneMockup`, une seule source `src/config/mockups.ts`.
- Accessibilité : contraste AA, cibles de 44 px minimum, navigation clavier, `alt`, `lang="fr"`, animations coupées si `prefers-reduced-motion`.

## Travail
- Lire le code avant de modifier ; changements minimaux.
- Avant de conclure : `bun run lint` puis `bun run build`, et regarder le rendu à 390, 768 et 1280 px.
- Répondre en français, brièvement ; décrire seulement ce qui a changé.
