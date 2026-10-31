import React, { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { AccentName, accentTheme } from './accent';
import { CartLine, buildOrderMessage } from './cart';
import { formatPrice, formatQty, priceUnit, whatsappUrl } from './format';
import { Sheet } from './Sheet';
import { displayName } from './text';

interface CartSheetProps {
  shopTitle: string;
  slug: string;
  accent: AccentName | null;
  /** Numéro WhatsApp déjà validé (chiffres seulement), ou null. */
  whatsappDigits: string | null;
  lines: CartLine[];
  total: number;
  onChange: (productId: string, direction: 1 | -1) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onClose: () => void;
}

// Limite prudente de la longueur d'un lien WhatsApp
const MAX_URL_LENGTH = 4000;

/** Panier : fenêtre qui monte du bas de l'écran. Rien n'est envoyé à nos serveurs : le client écrit lui-même sur WhatsApp. */
export const CartSheet: React.FC<CartSheetProps> = ({ shopTitle, slug, accent, whatsappDigits, lines, total, onChange, onRemove, onClear, onClose }) => {
  const [name, setName] = useState('');
  const [where, setWhere] = useState('');
  const theme = accentTheme(accent);

  const message = buildOrderMessage({ shopTitle, slug, lines, total, customerName: name, addressOrPickup: where });
  const link = whatsappDigits ? whatsappUrl(whatsappDigits, message) : null;
  const tooLong = link !== null && link.length > MAX_URL_LENGTH;

  return (
    <Sheet labelledBy="cart-title" onClose={onClose} style={{ '--accent': theme.color, '--on-accent': theme.on } as React.CSSProperties}>
      <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-5">
        <h2 id="cart-title" className="text-title font-black">
          Mon panier
        </h2>
        <button type="button" data-autofocus onClick={onClose} aria-label="Fermer le panier" className="flex h-11 w-11 items-center justify-center rounded-full bg-field">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="overflow-y-auto px-5 pb-5">
        {lines.length === 0 ? (
          <p className="py-8 text-lg">Votre panier est vide.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {lines.map(({ product: p, qty, amount }) => (
                <li key={p.id} className="rounded-3xl bg-field p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-base font-bold leading-snug">{displayName(p.name)}</p>
                      {p.variant && <p className="break-words text-sm text-muted">{p.variant}</p>}
                      <p className="mt-0.5 text-sm">
                        {formatPrice(p.price)} {priceUnit(p)}
                      </p>
                    </div>
                    <p className="shrink-0 text-lg font-black">{formatPrice(amount)}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => onChange(p.id, -1)}
                        aria-label={`Retirer ${p.byWeight ? '0,5 kg' : 'un'} de ${displayName(p.name)}`}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white"
                      >
                        <Minus className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <span className="min-w-14 text-center text-base font-bold" aria-live="polite">
                        {formatQty(qty, p.byWeight)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onChange(p.id, 1)}
                        aria-label={`Ajouter ${p.byWeight ? '0,5 kg' : 'un'} de ${displayName(p.name)}`}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white"
                      >
                        <Plus className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                    <button type="button" onClick={() => onRemove(p.id)} className="min-h-11 px-2 text-base font-semibold underline decoration-2 underline-offset-4">
                      Retirer
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-5 flex items-baseline justify-between gap-3 text-xl font-black">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="cart-name" className="block text-base font-bold">
                  Votre nom <span className="font-normal text-muted">(facultatif)</span>
                </label>
                <input
                  id="cart-name"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-12 w-full rounded-2xl bg-field px-4 text-lg focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-ink"
                />
              </div>
              <div>
                <label htmlFor="cart-where" className="block text-base font-bold">
                  Votre adresse ou retrait en boutique <span className="font-normal text-muted">(facultatif)</span>
                </label>
                <input
                  id="cart-where"
                  type="text"
                  autoComplete="street-address"
                  maxLength={200}
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder="Ex : livraison à la Médina, ou retrait en boutique"
                  className="mt-1 h-12 w-full rounded-2xl bg-field px-4 text-lg placeholder:text-muted focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-ink"
                />
              </div>
            </div>

            <p className="mt-5 text-base leading-relaxed">
              Aucun paiement en ligne : votre commande est envoyée à la boutique par WhatsApp, qui la confirme avec vous. Ces informations ne passent par aucun serveur QASH.
            </p>
          </>
        )}
      </div>

      {lines.length > 0 && (
        <div className="space-y-2 bg-white px-5 pb-5 pt-2">
          {link && !tooLong ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[var(--accent)] px-7 text-lg font-bold text-[var(--on-accent)]"
            >
              Commander sur WhatsApp
            </a>
          ) : (
            <p className="rounded-2xl bg-warning-soft p-4 text-base" role="status">
              {tooLong
                ? 'Votre panier est trop long pour un seul message : retirez quelques produits, ou commandez en deux fois.'
                : 'Cette boutique ne peut pas recevoir de commande par WhatsApp pour le moment.'}
            </p>
          )}
          <button type="button" onClick={onClear} className="flex min-h-11 w-full items-center justify-center text-base font-semibold underline decoration-2 underline-offset-4">
            Vider le panier
          </button>
        </div>
      )}
    </Sheet>
  );
};
