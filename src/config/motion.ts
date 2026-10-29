/**
 * Emplacements d'animation du site (composant <MotionSlot id="…" />).
 * Source unique : tableau des slots dans docs/DESIGN.md.
 *
 * - `src` / `srcWebm` : vidéo (MP4 et/ou WebM). Chemin du site (/motion/…) ou lien https complet.
 * - `poster` : image affichée d'abord, et seule image affichée si l'animation est coupée.
 * - `alt` : description lue par les lecteurs d'écran.
 * - `ratio` : proportions réservées pour éviter tout décalage de mise en page (ex. « 16/9 »).
 *
 * Tant que `src` et `srcWebm` sont vides, l'emplacement n'affiche rien de plus que l'illustration
 * actuelle de la page (repli).
 */
export interface MotionAsset {
  src: string;
  srcWebm: string;
  poster: string;
  alt: string;
  ratio: string;
}

export type MotionId = 'hors-ligne-synchro' | 'trois-etapes';

export const MOTION: Record<MotionId, MotionAsset> = {
  /** Accueil : section « Ça marche sans internet ». */
  'hors-ligne-synchro': {
    src: '',
    srcWebm: '',
    poster: '',
    alt: 'QASH enregistre la vente sans internet puis la synchronise au retour du réseau',
    ratio: '16/9',
  },
  /** /fonctionnalites (Hors ligne et synchronisation) et /comment-ca-marche : les 3 étapes. */
  'trois-etapes': {
    src: '',
    srcWebm: '',
    poster: '',
    alt: 'Trois étapes : vous vendez, la vente patiente, tout se synchronise',
    ratio: '16/9',
  },
};
