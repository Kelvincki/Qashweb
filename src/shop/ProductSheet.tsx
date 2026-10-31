import React from 'react';
import { X } from 'lucide-react';
import { Cart } from './cart';
import { ShopProduct } from './api';
import { fold, formatPrice, priceUnit } from './format';
import { displayName } from './text';
import { Sheet } from './Sheet';
import { AddControl, ProductPhoto } from './ProductCard';

/** Produits portant le même nom (variantes : tailles, parfums…), le produit ouvert en premier. */
export function variantsOf(product: ShopProduct, all: ShopProduct[]): ShopProduct[] {
  const key = fold(product.name.trim());
  const siblings = all.filter((p) => fold(p.name.trim()) === key);
  return [product, ...siblings.filter((p) => p.id !== product.id)];
}

/** Fiche détail d'un produit : photo, description et variantes regroupées. */
export const ProductSheet: React.FC<{
  product: ShopProduct;
  all: ShopProduct[];
  cart: Cart;
  onChange: (product: ShopProduct, direction: 1 | -1) => void;
  onClose: () => void;
  inert?: boolean;
}> = ({ product, all, cart, onChange, onClose, inert = false }) => {
  const variants = variantsOf(product, all);
  const unit = priceUnit(product);
  return (
    <Sheet labelledBy="product-title" onClose={onClose}>
      <div className="relative overflow-y-auto">
        <div className="aspect-[4/3] w-full bg-field-strong">
          <ProductPhoto product={product} priority />
        </div>
        <button
          type="button"
          onClick={onClose}
          data-autofocus
          aria-label="Fermer la fiche produit"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="p-5">
          {product.category && <p className="text-sm font-bold text-muted">{product.category}</p>}
          <h2 id="product-title" className="break-words text-title font-black">
            {displayName(product.name)}
          </h2>
          {variants.length === 1 && (
            <p className="mt-2 text-xl font-black">
              {formatPrice(product.price)}
              {unit && <span className="ml-1 text-base font-semibold">{unit}</span>}
              {product.variant && <span className="ml-2 text-base font-semibold text-muted">{product.variant}</span>}
            </p>
          )}
          {product.description && <p className="mt-3 whitespace-pre-line break-words text-lg leading-relaxed">{product.description}</p>}

          <h3 className="mt-6 text-lg font-black">{variants.length > 1 ? 'Variantes' : 'Commander'}</h3>
          <ul className="mt-2 space-y-2">
            {variants.map((v) => (
              <li key={v.id} className="rounded-3xl bg-field p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 break-words text-base font-bold">{v.variant || (variants.length > 1 ? 'Standard' : displayName(v.name))}</span>
                  <span className="shrink-0 text-lg font-black">
                    {formatPrice(v.price)}
                    {priceUnit(v) && <span className="ml-1 text-sm font-semibold">{priceUnit(v)}</span>}
                  </span>
                </div>
                <div className="mt-2">
                  <AddControl product={v} qty={cart[v.id] ?? 0} onChange={onChange} inert={inert} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Sheet>
  );
};
