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

## Mouvement

Discret : apparition des sections (opacité + 18 px, 0,5 s, une fois), retour au clic sur les boutons, survols. Tout est coupé si `prefers-reduced-motion: reduce`. Aucune bibliothèque d'animation sur les pages publiques.

## Performance

- Pages chargées à la demande (`React.lazy`) : l'accueil seul est dans le paquet principal.
- Police auto-hébergée, une famille, sous-ensemble latin.
- Images en WebP aux tailles affichées, dimensions déclarées, chargement différé hors premier écran.
