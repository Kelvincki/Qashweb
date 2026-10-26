import React from 'react';
import { MOCKUPS, Mockup, MockupId } from '../../config/mockups';

interface PhoneMockupProps {
  id: MockupId;
  /** Largeur du téléphone en pixels (la hauteur suit). */
  width?: number;
  className?: string;
  /** Image prioritaire (premier écran) : pas de chargement différé. */
  priority?: boolean;
}

/**
 * Téléphone dessiné en CSS avec un écran simplifié de l'app.
 * Source unique : src/config/mockups.ts (y renseigner `screenshot` pour passer aux vraies captures).
 */
export const PhoneMockup: React.FC<PhoneMockupProps> = ({ id, width = 280, className = '', priority = false }) => {
  const mockup = MOCKUPS[id];
  const height = Math.round(width * 2.05);

  return (
    <figure
      className={`relative shrink-0 rounded-[2.6rem] bg-ink p-[10px] ${className}`}
      style={{ width, height }}
      data-ui
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white">
        {mockup.screenshot ? (
          <img
            src={mockup.screenshot}
            alt={mockup.alt}
            className="h-full w-full object-cover object-top"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <div role="img" aria-label={mockup.alt} className="flex h-full flex-col text-ink">
            <StatusBar />
            <DrawnScreen mockup={mockup} />
          </div>
        )}
      </div>
      <span aria-hidden="true" className="absolute left-1/2 top-[18px] h-[18px] w-[30%] -translate-x-1/2 rounded-full bg-ink" />
    </figure>
  );
};

const StatusBar: React.FC = () => (
  <div className="flex h-9 shrink-0 items-end justify-between px-5 pb-1 text-[10px] font-bold text-ink/70" aria-hidden="true">
    <span>9:41</span>
    <span className="flex items-center gap-1">
      <span className="h-1.5 w-3 rounded-sm bg-ink/60" />
      <span className="h-1.5 w-4 rounded-sm bg-ink/60" />
    </span>
  </div>
);

/** Barre neutre à la place d'un montant (aucun chiffre inventé). */
const Placeholder: React.FC<{ w: string; tone?: string }> = ({ w, tone = 'bg-field-strong' }) => (
  <span className={`block h-2.5 rounded-full ${tone}`} style={{ width: w }} />
);

const DrawnScreen: React.FC<{ mockup: Mockup }> = ({ mockup }) => {
  if (mockup.kind === 'caisse') {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4" aria-hidden="true">
        <p className="pt-2 text-[22px] font-black tracking-tight">{mockup.title}</p>
        <div className="mt-3 h-9 rounded-full bg-field" />
        <ul className="mt-4 flex-1 space-y-2.5">
          {mockup.items.map((item, i) => (
            <li key={item} className="flex items-center justify-between gap-2 rounded-2xl bg-field px-3 py-2.5">
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-bold leading-tight">{item}</span>
                <span className="mt-1.5 block">
                  <Placeholder w={`${36 + ((i * 13) % 30)}px`} />
                </span>
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-black">
                +
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 rounded-2xl bg-ink px-4 py-3 text-white">
          <span className="block text-[11px] font-semibold text-white/70">{mockup.totalLabel}</span>
          <span className="mt-2 block">
            <Placeholder w="58%" tone="bg-white/35" />
          </span>
        </div>
        <span className="mt-2.5 flex h-11 items-center justify-center rounded-full bg-brand-red text-[14px] font-black text-white">
          {mockup.actionLabel}
        </span>
      </div>
    );
  }

  if (mockup.kind === 'stock') {
    const LEVEL = {
      ok: { label: 'En stock', cls: 'bg-success-soft text-success' },
      bas: { label: 'Stock bas', cls: 'bg-warning-soft text-[#7A4D00]' },
      rupture: { label: 'Rupture', cls: 'bg-danger-soft text-brand-red-dark' },
    } as const;
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4" aria-hidden="true">
        <p className="pt-2 text-[22px] font-black tracking-tight">{mockup.title}</p>
        <div className="mt-3 flex gap-1.5 text-[11px] font-bold">
          <span className="rounded-full bg-ink px-3 py-1.5 text-white">Tout</span>
          <span className="rounded-full bg-field px-3 py-1.5">Alertes</span>
        </div>
        <ul className="mt-4 space-y-2">
          {mockup.items.map((item, i) => (
            <li key={item.name} className="flex items-center justify-between gap-2 rounded-2xl bg-field px-3 py-2.5">
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-bold leading-tight">{item.name}</span>
                <span className="mt-1.5 block">
                  <Placeholder w={`${28 + ((i * 11) % 26)}px`} />
                </span>
              </span>
              <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${LEVEL[item.level].cls}`}>
                {LEVEL[item.level].label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4" aria-hidden="true">
      <p className="pt-2 text-[22px] font-black tracking-tight">{mockup.title}</p>
      <div className="mt-3 flex gap-1.5 text-[11px] font-bold">
        {mockup.periods.map((p, i) => (
          <span key={p} className={`rounded-full px-3 py-1.5 ${i === 0 ? 'bg-ink text-white' : 'bg-field'}`}>
            {p}
          </span>
        ))}
      </div>
      <div className="mt-4 flex h-32 items-end gap-2 rounded-2xl bg-field px-3 pb-3 pt-4">
        {mockup.bars.map((h, i) => (
          <span
            key={i}
            className={`flex-1 rounded-t-md ${i === mockup.bars.length - 2 ? 'bg-brand-red' : 'bg-ink'}`}
            style={{ height: `${Math.round(h * 100)}%` }}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {mockup.rows.map((row, i) => (
          <li key={row} className="flex items-center justify-between rounded-2xl bg-field px-3 py-3">
            <span className="text-[12px] font-bold">{row}</span>
            <Placeholder w={`${44 + i * 10}px`} />
          </li>
        ))}
      </ul>
    </div>
  );
};
