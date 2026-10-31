import React, { useState } from 'react';
import { Minus, Plus, Star } from 'lucide-react';
import { ShopProduct } from './api';
import { formatPrice, formatQty, priceUnit } from './format';
import { displayName } from './text';

/** Bouton « Ajouter » puis sélecteur de quantité. Le bouton reste visible en permanence. */
export const AddControl: React.FC<{
  product: ShopProduct;
  qty: number;
  onChange: (product: ShopProduct, direction: 1 | -1) => void;
  /** Aperçu de l'éditeur : rien n'est ajouté. */
  inert?: boolean;
}> = ({ product, qty, onChange, inert = false }) => {
  const name = displayName(product.name);
  if (!product.available || inert) {
    return (
      <button
        type="button"
        disabled
        className="flex min-h-11 w-full items-center justify-center rounded-full bg-field-strong px-3 text-base font-bold text-muted disabled:cursor-not-allowed"
      >
        {product.available ? 'Ajouter' : 'Indisponible'}
      </button>
    );
  }
  if (qty > 0) {
    return (
      <div className="flex items-center justify-between rounded-full bg-ink text-white">
        <button
          type="button"
          onClick={() => onChange(product, -1)}
          aria-label={`Retirer ${product.byWeight ? '0,5 kg' : 'un'} de ${name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          <Minus className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="min-w-0 truncate px-1 text-center text-sm font-bold" aria-live="polite">
          {formatQty(qty, product.byWeight)}
        </span>
        <button
          type="button"
          onClick={() => onChange(product, 1)}
          aria-label={`Ajouter ${product.byWeight ? '0,5 kg' : 'un'} de ${name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onChange(product, 1)}
      aria-label={`Ajouter ${name} au panier`}
      className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] px-3 text-base font-bold text-[var(--on-accent)] transition-transform active:scale-[0.97]"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Ajouter
    </button>
  );
};

/** Photo du produit, ou vignette de remplacement (initiale sur fond teinté par l'accent). */
export const ProductPhoto: React.FC<{ product: ShopProduct; priority?: boolean; className?: string }> = ({ product, priority = false, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : product.photoUrl;
  const dim = product.available ? '' : 'opacity-50';
  return src ? (
    <img
      src={src}
      alt={displayName(product.name)}
      width={400}
      height={400}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${dim} ${className}`}
    />
  ) : (
    <div
      aria-hidden="true"
      className={`flex h-full w-full items-center justify-center bg-[color-mix(in_srgb,var(--accent)_16%,white)] text-5xl font-black text-ink/40 ${dim} ${className}`}
    >
      {displayName(product.name).charAt(0).toUpperCase()}
    </div>
  );
};

interface ProductCardProps {
  product: ShopProduct;
  /** Quantité déjà dans le panier (0 si absent). */
  qty: number;
  onChange: (product: ShopProduct, direction: 1 | -1) => void;
  onOpen: (product: ShopProduct) => void;
  /** Les premières photos se chargent tout de suite (affichage rapide), les autres au défilement. */
  priority?: boolean;
  inert?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, qty, onChange, onOpen, priority = false, inert = false, className = '' }) => {
  const unit = priceUnit(product);
  return (
    <li className={`flex flex-col overflow-hidden rounded-[1.5rem] bg-field ${product.available ? '' : 'text-ink/60'} ${className}`}>
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="flex flex-1 flex-col text-left focus-visible:outline-offset-[-3px]"
      >
        {/* Dimensions réservées : la grille ne bouge pas pendant le chargement des photos */}
        <span className="relative block aspect-square w-full bg-field-strong">
          <ProductPhoto product={product} priority={priority} />
          {!product.available && (
            <span className="absolute left-2 top-2 rounded-full bg-ink px-3 py-1 text-sm font-bold text-white">Rupture</span>
          )}
          {product.featured && product.available && (
            <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white" title="Coup de cœur">
              <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" aria-hidden="true" />
              <span className="sr-only">Coup de cœur</span>
            </span>
          )}
        </span>
        <span className="flex flex-1 flex-col p-3 pb-1">
          <span className="break-words text-base font-bold leading-snug">{displayName(product.name)}</span>
          {product.variant && <span className="mt-0.5 break-words text-sm text-muted">{product.variant}</span>}
          <span className="mt-2 text-lg font-black leading-tight">
            {formatPrice(product.price)}
            {unit && <span className="ml-1 text-sm font-semibold">{unit}</span>}
          </span>
        </span>
      </button>
      <div className="p-3 pt-2">
        <AddControl product={product} qty={qty} onChange={onChange} inert={inert} />
      </div>
    </li>
  );
};
