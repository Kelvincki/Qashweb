# QASH — direction de design du site

## Direction retenue : « Loud and flat » (affiche de rue)

Choisie parmi les directions proposées par le skill *design-taste-frontend* (`loud-flat-poster`), avec la palette de la marque conservée.

**Pourquoi.** QASH s'adresse aux commerces de proximité de Dakar : boutiques de quartier, restaurants, quincailleries. Leur monde visuel, ce sont les enseignes peintes à la main, les façades aux couleurs pleines, les affiches collées. Une page « affiche » parle cette langue : des phrases qu'on dirait à voix haute, en très gros, sur des aplats de couleur. Elle sert aussi les quatre critères du brief :

- **commerce de proximité** : la forme de l'enseigne et de l'affiche, pas celle d'un logiciel de bureau ;
- **énergie** : rouge et jaune de la marque en champs entiers, typographie noire très grasse ;
- **confiance** : contenu complet et vérifiable (prix, règles de l'essai et de la grâce), aucun faux chiffre, aucun faux témoignage ;
- **simplicité** : une idée par section, trois tailles de texte, deux boutons au plus.

Directions écartées : *Colour chapters* (sections de 90 % d'écran trop longues à faire défiler en 3G), *The page is the object* (le ticket de caisse comme objet unique enfermait trop le contenu), *Product performs* (impossible honnêtement tant que l'interface de l'app est en cours de refonte).

**L'idée.** Sur ce site, *l'enseigne peinte de la boutique* devient *les panneaux de couleur pleine* : chaque section est un panneau (blanc, rouge, jaune, noir) qui porte une phrase courte, comme une façade de quartier.

**L'élément vivant.** Sur `/tarifs`, un estimateur : on choisit le nombre d'employés, le montant mensuel s'affiche (5 000 + 3 500 × employés). Il précise que le montant exact est calculé par le serveur au paiement.

## Couleurs

| Rôle | Valeur | Usage |
| --- | --- | --- |
| Fond | `#FFFFFF` (`paper`) | fond principal |
| Fond secondaire | `#F4F4F5` (`field`) | sections alternées, cartes de FAQ, pied de page |
| Encre | `#18181B` (`ink`) | texte, section sombre, bouton secondaire |
| Accent | `#E8161F` (`brand-red`) | boutons d'action, section « hors ligne », bandeau final |
| Accent survol | `#C1121A` (`brand-red-dark`) | survol des boutons rouges, texte rouge sur fond clair |
| Champ | `#FFB000` (`brand-yellow`) | panneau du téléphone, chiffre clé, bouton sur fond noir |
| Texte secondaire | `#52525B` (`muted`) | notes et intitulés de colonnes uniquement |

Contrastes vérifiés (WCAG) : encre sur blanc 17,7:1 ; blanc sur rouge 4,6:1 (AA) ; encre sur jaune 9,6:1 ; jaune sur encre 9,6:1 ; `muted` sur blanc 7,7:1. **Jamais de texte blanc sur jaune** (1,9:1).

Mode sombre : non retenu. Le logo fourni a un fond blanc et ne s'affiche proprement que sur fond clair (fusionné par `mix-blend-mode: multiply`). À reconsidérer quand une version transparente ou SVG du logo existera.

## Typographie

- **Archivo** (variable, poids 100–900), auto-hébergée via `@fontsource-variable/archivo` : une seule famille, ~35 Ko (sous-ensemble latin, chargé seulement si nécessaire), `font-display: swap`.
- Trois tailles font le travail visible (jetons dans `src/index.css`) :
  - `text-display` : titre de page, `clamp(38px → 108px)`, graisse 900, interligne 0,95, approche −0,035 em ;
  - `text-headline` : titres de section, `clamp(32px → 68px)`, graisse 900 ;
  - `text-title` : sous-titres, `clamp(22px → 30px)`, graisse 900.
- Corps : 18 px (20–24 px pour les phrases d'introduction), interligne 1,55, 45 à 75 caractères par ligne.
- Titres : deux lignes au plus à toutes les largeurs.

## Composants (`src/components/ui/`)

| Composant | Rôle |
| --- | --- |
| `Button`, `ButtonLink`, `ExternalButton` | boutons pleins, entièrement arrondis, 48 px (56 px en `lg`), variantes `primary` (rouge), `dark`, `light`, `quiet`, `yellow` |
| `DownloadButton` | « Télécharger l'app » : lien Google Play si `PLAY_STORE_URL` est renseigné, sinon page `/telecharger` |
| `Container`, `Section`, `PageHero`, `Reveal` | marges égales (20/32 px), champs de couleur, en-tête de page, apparition au défilement |
| `FaqList` | accordéon accessible (boutons natifs, `aria-expanded`) |
| `CtaBand` | bandeau d'appel final rouge |
| `PhoneMockup` | téléphone dessiné en CSS, écrans simplifiés |
| `Wordmark`, `QIcon`, `TextWordmark` | logos de `public/brand/`, repli texte si le fichier manque |
| `CookieNotice` | bandeau d'information cookies (pas de consentement à recueillir) |

Règles de la maison (skill) appliquées : pas d'ombre au repos, pas de dégradé, pas de filet fin, pas d'étiquette en petites capitales au-dessus des titres, pas de cartes à icône, pas de verre dépoli, pas d'emoji. Les cartes de FAQ et de bénéfices sont des aplats (un pas de ton), pas des boîtes à bordure.

## Images et logo

- `public/brand/qash-icon.png` : le Q seul (coins transparents). Sert au favicon (`favicon.ico` 16/32/48), aux icônes web (`icon-192.png`, `icon-512.png`), à l'icône Apple (`apple-touch-icon.png`, fond blanc) et à l'image d'aperçu des liens (`og-image.png`, 1200 × 630).
- `public/brand/qash-wordmark.png` : « Qash » complet, recadré sur ses marges et fond ramené au blanc pur ; variantes WebP 160/320/640 px. En-tête et pied de page, sur fond clair uniquement.
- Le logo n'est ni redessiné ni déformé. **TODO** : obtenir une version SVG ou à fond transparent du logo (elle permettra un mode sombre et un rendu plus net).
- Aucune photo de banque d'images.

### TODO — captures de l'application

Les écrans de téléphone du site sont **dessinés** (l'interface de l'app est en cours de refonte), sans chiffres de vente : les montants sont remplacés par des barres neutres. Pour passer aux vraies captures :

1. déposer les images dans `public/screens/` (WebP, environ 1080 px de large, écran seul sans cadre) ;
2. renseigner `screenshot: '/screens/<nom>.webp'` pour chaque écran dans `src/config/mockups.ts`.

`PhoneMockup` affiche alors l'image (chargement différé) partout sur le site, sans autre modification.

## Écarts assumés par rapport au skill

Les règles du brief passent avant les conseils du skill. Écarts volontaires :

- **Scripts du skill non exécutés** (`draw.mjs`, `inspect.mjs`, `assets.mjs`) : code tiers signalé « Med Risk » à l'installation. La direction a été choisie en lisant sa bibliothèque (`library/directions.json`) ; la boucle « regarder à 3 largeurs » a été faite avec des captures Edge headless à 390, 768 et 1280 px.
- **Pas de photos trouvées** : le skill demande au moins quatre vraies images par page ; ici, pas de photo de banque d'images et pas de capture de l'app (interface en refonte). Les images sont les maquettes de téléphone dessinées et les champs de couleur.
- **Mouvement minimal** : le skill exige une couche de mouvement fournie ; le brief demande des animations discrètes et un site léger. On garde une apparition au défilement et des retours au clic, sans bibliothèque.
- **Étapes numérotées** sur « Comment ça marche » et « Télécharger » : le skill déconseille la numérotation ; pour un mode d'emploi lu sur téléphone, les numéros aident. Ce sont de vraies listes `<ol>`.
- **Pastilles de navigation** (liens d'ancre en haut des pages longues) : utiles au pouce sur mobile.

## Mouvement

Discret : apparition des sections (opacité + 18 px, 0,5 s, une fois), retour au clic sur les boutons, survols. Tout est coupé si `prefers-reduced-motion: reduce`. Aucune bibliothèque d’animation (la dépendance `motion` a été retirée).

### Emplacements d'animation (`MotionSlot`)

`<MotionSlot id="…" />` (`src/components/ui/MotionSlot.tsx`) lit `src/config/motion.ts` (`{ src, srcWebm, poster, alt, ratio }`). Chemins du site (`/motion/…`) ou liens `https://` complets. Comportement :

- le **poster** s'affiche d'abord ; la vidéo n'est montée que lorsque l'emplacement approche de l'écran (chargement paresseux), puis joue **muette, en boucle, seulement quand elle est visible** ;
- avec `prefers-reduced-motion: reduce` : poster fixe, aucune vidéo chargée ;
- les proportions (`ratio`) sont réservées d'avance : aucun décalage de mise en page ;
- si `src` et `srcWebm` sont vides (ou si la vidéo échoue sans poster), l'emplacement affiche l'illustration actuelle de la page (le contenu passé en `children`, ou rien).

| Slot (`id`) | Où | Ratio | Repli (vidéo vide) | Fichiers attendus (`public/motion/`) |
| --- | --- | --- | --- | --- |
| `hors-ligne-synchro` | Accueil, section « Ça marche sans internet » | 16/9 | rien : les trois colonnes de texte restent | `qash_site_hors-ligne-synchro_16x9` (.mp4, .webm, `_poster.png`) |
| `trois-etapes` | `/fonctionnalites` (Hors ligne et synchronisation) et `/comment-ca-marche` (Et sans internet ?) | 16/9 | rien : les trois étapes de texte restent | `qash_site_3-etapes_16x9` (.mp4, .webm, `_poster.png`) |

Les emplacements sont vides tant que les vidéos ne sont pas déposées (étape S3).

## Boutique publique (`/b/:slug`) et éditeur

Page autonome (pas de menu ni de pied de page du site), mobile d'abord. Sections dans l'ordre, **une section sans donnée n'est pas affichée** : hero (bannière 3:1 ou fond dégradé à la couleur d'accent, logo rond, accroche, badge Ouvert/Fermé, boutons), coups de cœur, catalogue (recherche, catégories collantes, tri, fiche détail), à propos, infos pratiques (horaires, adresse, livraison, paiement indiqué, réseaux), panier flottant, pied de page « Boutique créée avec QASH ».

- **Couleur d'accent** choisie par le gérant : rouge `#E8161F` (défaut), ambre `#FFB000`, vert `#16A34A`, bleu `#2563EB`, noir `#18181B`. Le texte posé dessus est noir ou blanc selon le meilleur contraste (`src/shop/accent.ts`, AA minimum vérifié pour les cinq).
- **Mise en page par « container queries »** (`@container`, variantes `@2xl:` etc.) : la même composante `ShopView` sert pleine page et dans l'aperçu en direct de l'éditeur (colonne de 400 px).
- **Heure d'ouverture** : fuseau Africa/Dakar (UTC+0), plages passant minuit gérées, aucun badge si le jour du jour n'est pas renseigné (`src/shop/hours.ts`).
- **Rien de la base n'est injecté en HTML brut** ; les liens de réseaux sont construits à partir d'identifiants validés (`src/shop/social.ts`). Les données structurées (JSON-LD Store/Restaurant) ne contiennent que ce que la boutique a fourni, ni prix ni disponibilité.
- Éditeur `/ma-boutique-en-ligne` (gérant) : enregistrement dans l'ordre `catalog_save_settings` → `catalog_save_profile` → `catalog_set_items`, seuls les champs modifiés sont envoyés.

## Performance

- Pages chargées à la demande (`React.lazy`) : l'accueil seul est dans le paquet principal.
- Police auto-hébergée, une famille, sous-ensemble latin.
- Images en WebP aux tailles affichées, dimensions déclarées, chargement différé hors premier écran.
