import React, { useState } from 'react';
import { ShopProduct, imageUrl } from './api';
import { formatPrice, priceUnit } from './format';

interface ProductCardProps {
  product: ShopProduct;
  /** Les premières photos se chargent tout de suite (affichage rapide), les autres au défilement. */
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const [photoFailed, setPhotoFailed] = useState(false);
  const src = photoFailed ? null : imageUrl(product.photo, product.v);
  const unit = priceUnit(product);

  return (
    <li className="flex flex-col overflow-hidden rounded-[1.5rem] bg-field">
      {/* Dimensions réservées : la grille ne bouge pas pendant le chargement des photos */}
      <div className="relative aspect-square w-full bg-field-strong">
        {src ? (
          <img
            src={src}
            alt={product.name}
            width={400}
            height={400}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            onError={() => setPhotoFailed(true)}
            className={`h-full w-full object-cover ${product.available ? '' : 'opacity-50'}`}
          />
        ) : (
          <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-5xl font-black text-ink/30">
            {product.name.charAt(0).toUpperCase()}
          </div>
        )}
        {!product.available && (
          <span className="absolute left-2 top-2 rounded-full bg-ink px-3 py-1 text-sm font-bold text-white">Rupture</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="break-words text-base font-bold leading-snug">{product.name}</h3>
        {product.variant && <p className="mt-0.5 break-words text-sm text-muted">{product.variant}</p>}
        {product.description && <p className="mt-1 line-clamp-2 break-words text-sm leading-snug">{product.description}</p>}
        <p className="mt-2 text-lg font-black leading-tight">
          {formatPrice(product.price)}
          {unit && <span className="ml-1 text-sm font-semibold">{unit}</span>}
        </p>
        <div className="mt-auto pt-3">
          <button
            type="button"
            disabled
            className="flex min-h-11 w-full items-center justify-center rounded-full bg-field-strong px-3 text-base font-bold text-muted disabled:cursor-not-allowed"
          >
            Ajouter
          </button>
        </div>
      </div>
    </li>
  );
};
