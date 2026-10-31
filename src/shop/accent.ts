/**
 * Couleur d'accent de la boutique (choisie par le gérant). Le texte posé dessus est noir ou blanc,
 * selon le meilleur contraste (WCAG).
 */

export type AccentName = 'rouge' | 'ambre' | 'vert' | 'bleu' | 'noir';

export const ACCENT_NAMES: AccentName[] = ['rouge', 'ambre', 'vert', 'bleu', 'noir'];

export const ACCENT_HEX: Record<AccentName, string> = {
  rouge: '#E8161F',
  ambre: '#FFB000',
  vert: '#16A34A',
  bleu: '#2563EB',
  noir: '#18181B',
};

export const ACCENT_LABEL: Record<AccentName, string> = {
  rouge: 'Rouge',
  ambre: 'Ambre',
  vert: 'Vert',
  bleu: 'Bleu',
  noir: 'Noir',
};

export const DEFAULT_ACCENT: AccentName = 'rouge';

const INK = '#18181B';
const WHITE = '#FFFFFF';

export function isAccentName(value: unknown): value is AccentName {
  return typeof value === 'string' && (ACCENT_NAMES as string[]).includes(value);
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Texte lisible sur la couleur donnée : celui des deux (noir ou blanc) qui a le meilleur contraste. */
export function readableOn(background: string): string {
  return contrastRatio(background, WHITE) >= contrastRatio(background, INK) ? WHITE : INK;
}

export interface AccentTheme {
  name: AccentName;
  /** Couleur d'accent. */
  color: string;
  /** Couleur du texte posé sur l'accent. */
  on: string;
  /** Vrai si le texte posé sur l'accent est foncé. */
  onIsDark: boolean;
}

export function accentTheme(accent: AccentName | null | undefined): AccentTheme {
  const name = accent && isAccentName(accent) ? accent : DEFAULT_ACCENT;
  const color = ACCENT_HEX[name];
  const on = readableOn(color);
  return { name, color, on, onIsDark: on === INK };
}
