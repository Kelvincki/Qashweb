import React, { useState } from 'react';
import { Check, Circle, ImagePlus, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { inputClass } from '../components/ui/AuthShell';
import { formatPrice, priceUnit } from '../shop/format';
import { ACCENT_HEX, ACCENT_LABEL, ACCENT_NAMES, AccentName, readableOn } from '../shop/accent';
import { DAY_KEYS, DAY_LABEL } from '../shop/hours';
import { CatalogItem, EditorProduct, publicImageUrl } from './api';
import { Completion } from './completion';
import { DEFAULT_CLOSE, DEFAULT_OPEN, HoursForm, copyMonday, hoursSetCount, touch } from './hoursForm';

export const Panel: React.FC<{ children: React.ReactNode; id?: string }> = ({ children, id }) => (
  <section id={id} className="rounded-[2rem] bg-white p-6 sm:p-8">
    {children}
  </section>
);

export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string; labelledBy?: string; describedBy?: string }> = ({
  checked,
  onChange,
  label,
  labelledBy,
  describedBy,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    aria-labelledby={labelledBy}
    aria-describedby={describedBy}
    onClick={() => onChange(!checked)}
    className="group flex h-11 w-16 shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ink"
  >
    <span className={`flex h-8 w-14 items-center rounded-full px-1 transition-colors ${checked ? 'bg-ink' : 'bg-field-strong'}`}>
      <span className={`h-6 w-6 rounded-full transition-transform ${checked ? 'translate-x-6 bg-brand-yellow' : 'translate-x-0 bg-white'}`} />
    </span>
  </button>
);

/** Compteur « 12 / 80 » : devient rouge près de la limite. */
const Counter: React.FC<{ value: string; max: number }> = ({ value, max }) => (
  <span className={`text-base tabular-nums ${value.length >= max ? 'font-bold text-brand-red-dark' : 'text-muted'}`} aria-hidden="true">
    {value.length} / {max}
  </span>
);

export const CounterField: React.FC<{
  id: string;
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  placeholder?: string;
}> = ({ id, label, value, max, onChange, rows = 1, hint, placeholder }) => (
  <div>
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="block text-lg font-bold">
        {label}
      </label>
      <Counter value={value} max={max} />
    </div>
    {rows > 1 ? (
      <textarea
        id={id}
        rows={rows}
        maxLength={max}
        value={value}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 ${inputClass}`}
      />
    ) : (
      <input
        id={id}
        type="text"
        maxLength={max}
        value={value}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 ${inputClass}`}
      />
    )}
    <p className="sr-only" aria-live="polite">
      {value.length >= max ? `Limite de ${max} caractères atteinte` : ''}
    </p>
    {hint && (
      <p id={`${id}-hint`} className="mt-2 text-base text-muted">
        {hint}
      </p>
    )}
  </div>
);

export const HoursEditor: React.FC<{ value: HoursForm; onChange: (next: HoursForm) => void; problem: string | null }> = ({ value, onChange, problem }) => {
  const setDay = (key: (typeof DAY_KEYS)[number], patch: Partial<HoursForm[typeof key]>) => {
    const next = touch(value);
    next[key] = { ...next[key], ...patch };
    onChange(next);
  };
  return (
    <div>
      <ul className="space-y-2">
        {DAY_KEYS.map((key) => {
          const day = value[key];
          const open = day.state === 'open';
          return (
            <li key={key} className="rounded-3xl bg-field p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p id={`hours-${key}`} className="text-base font-bold">
                    {DAY_LABEL[key]}
                  </p>
                  <p className="text-sm text-muted">{day.state === 'open' ? 'Ouvert' : day.state === 'closed' ? 'Fermé' : 'Non renseigné'}</p>
                </div>
                <Switch
                  checked={open}
                  labelledBy={`hours-${key}`}
                  onChange={(v) => setDay(key, v ? { state: 'open', open: day.open || DEFAULT_OPEN, close: day.close || DEFAULT_CLOSE } : { state: 'closed' })}
                />
              </div>
              {open && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label htmlFor={`hours-${key}-open`} className="sr-only">
                    {DAY_LABEL[key]} : ouverture
                  </label>
                  <input
                    id={`hours-${key}-open`}
                    type="time"
                    value={day.open}
                    onChange={(e) => setDay(key, { open: e.target.value })}
                    className={`${inputClass} !w-auto min-w-[8.5rem]`}
                  />
                  <span aria-hidden="true" className="text-base font-bold">
                    à
                  </span>
                  <label htmlFor={`hours-${key}-close`} className="sr-only">
                    {DAY_LABEL[key]} : fermeture
                  </label>
                  <input
                    id={`hours-${key}-close`}
                    type="time"
                    value={day.close}
                    onChange={(e) => setDay(key, { close: e.target.value })}
                    className={`${inputClass} !w-auto min-w-[8.5rem]`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {problem && (
        <p role="alert" className="mt-3 text-base font-bold text-brand-red-dark">
          {problem}
        </p>
      )}
      <p className="mt-3 text-base text-muted">Heure du Sénégal. Si la fermeture est avant l’ouverture, la boutique ferme après minuit.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="quiet" onClick={() => onChange(copyMonday(value))}>
          Copier du lundi vers tous les jours
        </Button>
        {hoursSetCount(value) > 0 && (
          <Button
            variant="quiet"
            onClick={() => onChange(Object.fromEntries(DAY_KEYS.map((k) => [k, { state: 'unset', open: DEFAULT_OPEN, close: DEFAULT_CLOSE }])) as HoursForm)}
          >
            Effacer les horaires
          </Button>
        )}
      </div>
    </div>
  );
};

/** Choix de la couleur de la boutique : cinq pastilles. */
export const AccentPicker: React.FC<{ value: AccentName | null; onChange: (v: AccentName) => void }> = ({ value, onChange }) => {
  const current = value ?? 'rouge';
  return (
    <div role="radiogroup" aria-label="Couleur de la boutique" className="flex flex-wrap gap-3">
      {ACCENT_NAMES.map((name) => {
        const selected = current === name;
        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${ACCENT_LABEL[name]}${value === null && name === 'rouge' ? ' (par défaut)' : ''}`}
            onClick={() => onChange(name)}
            style={{ backgroundColor: ACCENT_HEX[name], color: readableOn(ACCENT_HEX[name]) }}
            className={`flex h-12 w-12 items-center justify-center rounded-full focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ink focus-visible:ring-offset-2 ${
              selected ? 'ring-[3px] ring-ink ring-offset-2' : ''
            }`}
          >
            {selected && <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
};

export const CompletionCard: React.FC<{ completion: Completion }> = ({ completion }) => (
  <Panel>
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-title font-black">Votre boutique est complète à {completion.percent}&nbsp;%</h2>
      <p className="text-base text-muted">
        {completion.done} point{completion.done > 1 ? 's' : ''} sur {completion.items.length}
      </p>
    </div>
    <div
      role="progressbar"
      aria-label="Complétion de la boutique"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={completion.percent}
      className="mt-4 h-3 w-full overflow-hidden rounded-full bg-field-strong"
    >
      <div className="h-full rounded-full bg-ink transition-[width]" style={{ width: `${completion.percent}%` }} />
    </div>
    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
      {completion.items.map((item) => (
        <li key={item.id} className={`flex items-start gap-2 text-base ${item.done ? '' : 'font-semibold'}`}>
          {item.done ? (
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" strokeWidth={3} aria-hidden="true" />
          ) : (
            <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
          )}
          <span>
            {item.label}
            <span className="sr-only">{item.done ? ' : fait' : ' : à faire'}</span>
          </span>
        </li>
      ))}
    </ul>
  </Panel>
);

export const ProductRow: React.FC<{
  product: EditorProduct;
  item: CatalogItem;
  pendingUrl: string | null;
  onToggle: (visible: boolean) => void;
  onFeature: (featured: boolean) => void;
  onPick: () => void;
  onRemovePhoto: () => void;
}> = ({ product, item, pendingUrl, onToggle, onFeature, onPick, onRemovePhoto }) => {
  const [failed, setFailed] = useState(false);
  const src = pendingUrl ?? (failed ? null : publicImageUrl(item.photoPath));
  const unit = priceUnit(product);
  return (
    <li className={`rounded-3xl p-3 ${item.visible ? 'bg-field' : 'bg-field/60'}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-field-strong">
          {src ? (
            <img src={src} alt="" width={56} height={56} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true" className="text-2xl font-black text-ink/30">
              {product.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-base font-bold leading-snug">{product.name}</p>
          {product.variant && <p className="break-words text-sm text-muted">{product.variant}</p>}
          <p className="text-base font-semibold">
            {formatPrice(product.price)}
            {unit && <span className="ml-1 text-sm">{unit}</span>}
            {!product.available && <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-sm font-bold text-white">Rupture</span>}
          </p>
        </div>
        <Switch checked={item.visible} onChange={onToggle} label={`${item.visible ? 'Masquer' : 'Afficher'} « ${product.name} » dans la boutique`} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 pl-[68px]">
        <button
          type="button"
          onClick={onPick}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-base font-semibold hover:bg-field-strong focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ink"
        >
          <ImagePlus className="h-5 w-5" aria-hidden="true" />
          {src ? 'Changer la photo' : 'Ajouter une photo'}
          <span className="sr-only"> de {product.name}</span>
        </button>
        {(item.photoPath || pendingUrl) && (
          <button
            type="button"
            onClick={onRemovePhoto}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-base font-semibold underline decoration-2 underline-offset-4 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ink"
          >
            Retirer la photo<span className="sr-only"> de {product.name}</span>
          </button>
        )}
        <button
          type="button"
          aria-pressed={item.featured}
          onClick={() => onFeature(!item.featured)}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-base font-semibold focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ink ${
            item.featured ? 'bg-brand-yellow text-ink' : 'bg-white hover:bg-field-strong'
          }`}
        >
          <Star className={`h-5 w-5 ${item.featured ? 'fill-ink' : ''}`} aria-hidden="true" />
          Coup de cœur
          <span className="sr-only"> : {product.name}</span>
        </button>
      </div>
    </li>
  );
};
