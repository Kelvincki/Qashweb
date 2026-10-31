import { DAY_KEYS, DayKey, Hours, TIME_RE } from '../shop/hours';

/**
 * Horaires dans l'éditeur. Trois états par jour :
 * « unset » (non renseigné : clé absente côté serveur), « closed » (fermé : null) et « open » (deux heures).
 */
export interface DayForm {
  state: 'unset' | 'closed' | 'open';
  open: string;
  close: string;
}

export type HoursForm = Record<DayKey, DayForm>;

/** Heures proposées quand on ouvre un jour : à modifier par le gérant. */
export const DEFAULT_OPEN = '08:00';
export const DEFAULT_CLOSE = '18:00';

export function emptyHoursForm(): HoursForm {
  return Object.fromEntries(DAY_KEYS.map((k) => [k, { state: 'unset', open: DEFAULT_OPEN, close: DEFAULT_CLOSE }])) as HoursForm;
}

export function hoursToForm(hours: Hours | null): HoursForm {
  const form = emptyHoursForm();
  if (!hours) return form;
  for (const key of DAY_KEYS) {
    if (!(key in hours)) continue;
    const slot = hours[key];
    form[key] = slot ? { state: 'open', open: slot.open, close: slot.close } : { state: 'closed', open: DEFAULT_OPEN, close: DEFAULT_CLOSE };
  }
  return form;
}

/** Horaires à envoyer : seulement les jours renseignés ; null si aucun jour ne l'est (efface les horaires). */
export function formToHours(form: HoursForm): Hours | null {
  const hours: Hours = {};
  for (const key of DAY_KEYS) {
    const day = form[key];
    if (day.state === 'closed') hours[key] = null;
    else if (day.state === 'open') hours[key] = { open: day.open, close: day.close };
  }
  return Object.keys(hours).length > 0 ? hours : null;
}

/** Dès qu'on modifie les horaires, les jours non renseignés deviennent « fermé » : le tableau est alors complet. */
export function touch(form: HoursForm): HoursForm {
  const next = { ...form };
  for (const key of DAY_KEYS) {
    if (next[key].state === 'unset') next[key] = { ...next[key], state: 'closed' };
  }
  return next;
}

/** Copie le lundi (ouvert/fermé et heures) vers les six autres jours. */
export function copyMonday(form: HoursForm): HoursForm {
  const monday = form.mon.state === 'unset' ? { ...form.mon, state: 'closed' as const } : form.mon;
  const next = { ...form };
  for (const key of DAY_KEYS) next[key] = { ...monday };
  return next;
}

/** Message en français si une heure est invalide, sinon null. */
export function validateHoursForm(form: HoursForm): string | null {
  for (const key of DAY_KEYS) {
    const day = form[key];
    if (day.state === 'open' && (!TIME_RE.test(day.open) || !TIME_RE.test(day.close))) {
      return 'Vérifiez les horaires : chaque heure doit être complète, par exemple 08:30.';
    }
  }
  return null;
}

export function hoursSetCount(form: HoursForm): number {
  return DAY_KEYS.filter((k) => form[k].state !== 'unset').length;
}
