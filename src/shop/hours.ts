/**
 * Horaires d'ouverture. Format du serveur : un objet avec les clés mon…sun ; chaque valeur est
 * { open: "HH:MM", close: "HH:MM" } ou null (fermé) ; une clé absente = non renseigné.
 * Si close < open, l'ouverture passe minuit. Fuseau Africa/Dakar = UTC+0, sans heure d'été :
 * on lit donc l'heure UTC.
 */

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const DAY_LABEL: Record<DayKey, string> = {
  mon: 'Lundi',
  tue: 'Mardi',
  wed: 'Mercredi',
  thu: 'Jeudi',
  fri: 'Vendredi',
  sat: 'Samedi',
  sun: 'Dimanche',
};

export const DAY_SCHEMA: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export interface Slot {
  open: string;
  close: string;
}

/** null = fermé ; clé absente = non renseigné. */
export type Hours = Partial<Record<DayKey, Slot | null>>;

export const TIME_RE = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

/** Nettoie les horaires reçus : ne garde que les jours et heures valides. Renvoie null s'il ne reste rien. */
export function normalizeHours(input: unknown): Hours | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const raw = input as Record<string, unknown>;
  const hours: Hours = {};
  for (const key of DAY_KEYS) {
    if (!(key in raw)) continue;
    const v = raw[key];
    if (v === null) {
      hours[key] = null;
    } else if (v && typeof v === 'object') {
      const { open, close } = v as Record<string, unknown>;
      if (typeof open === 'string' && typeof close === 'string' && TIME_RE.test(open) && TIME_RE.test(close)) {
        hours[key] = { open, close };
      }
    }
  }
  return Object.keys(hours).length > 0 ? hours : null;
}

const toMinutes = (hhmm: string): number => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Jours renseignés, dans l'ordre de la semaine. */
export function definedDays(hours: Hours | null | undefined): DayKey[] {
  if (!hours) return [];
  return DAY_KEYS.filter((k) => k in hours);
}

/** Jour de la semaine actuel au Sénégal (UTC+0). */
export function dayKeyAt(now: Date): DayKey {
  // getUTCDay : 0 = dimanche
  return DAY_KEYS[(now.getUTCDay() + 6) % 7];
}

export type OpenStatus =
  | { state: 'open'; label: string; closesAt: string }
  | { state: 'closed'; label: string; opensAt: string | null };

/**
 * Ouvert ou fermé à l'instant `now`. Renvoie null si on ne sait pas (pas d'horaires, ou jour du jour
 * non renseigné) : l'interface n'affiche alors aucun badge.
 * Horaires identiques à l'ouverture et à la fermeture : ouvert toute la journée.
 */
export function openStatus(hours: Hours | null | undefined, now: Date = new Date()): OpenStatus | null {
  if (!hours || definedDays(hours).length === 0) return null;

  const today = dayKeyAt(now);
  const todayIndex = DAY_KEYS.indexOf(today);
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  // Une plage de la veille qui passe minuit peut encore courir ce matin
  const yesterday = DAY_KEYS[(todayIndex + 6) % 7];
  const ySlot = hours[yesterday];
  if (ySlot && toMinutes(ySlot.close) < toMinutes(ySlot.open) && minutes < toMinutes(ySlot.close)) {
    return { state: 'open', label: `Ouvert maintenant · ferme à ${ySlot.close}`, closesAt: ySlot.close };
  }

  if (!(today in hours)) return null;
  const slot = hours[today];

  if (slot) {
    const open = toMinutes(slot.open);
    const close = toMinutes(slot.close);
    if (open === close) return { state: 'open', label: 'Ouvert maintenant', closesAt: slot.close };
    const isOpen = open < close ? minutes >= open && minutes < close : minutes >= open;
    if (isOpen) return { state: 'open', label: `Ouvert maintenant · ferme à ${slot.close}`, closesAt: slot.close };
    if (minutes < open) return { state: 'closed', label: `Fermé · ouvre à ${slot.open}`, opensAt: slot.open };
  }

  // Fermé : prochaine ouverture dans les 7 jours suivants
  for (let offset = 1; offset <= 7; offset++) {
    const key = DAY_KEYS[(todayIndex + offset) % 7];
    const next = hours[key];
    if (!next) continue;
    const when = offset === 1 ? 'demain' : DAY_LABEL[key].toLowerCase();
    return { state: 'closed', label: `Fermé · ouvre ${when} à ${next.open}`, opensAt: next.open };
  }
  return { state: 'closed', label: 'Fermé', opensAt: null };
}

/** Texte d'une ligne du tableau des horaires, ou null si le jour n'est pas renseigné. */
export function slotText(hours: Hours, key: DayKey): string | null {
  if (!(key in hours)) return null;
  const slot = hours[key];
  if (!slot) return 'Fermé';
  return slot.open === slot.close ? 'Ouvert toute la journée' : `${slot.open} – ${slot.close}`;
}
