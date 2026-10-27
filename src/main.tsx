import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { getShopSlug } from './lib/shopSlug';
import './index.css';

/**
 * Deux applications, une seule entrée :
 *  - boutique publique ({slug}.useqash.com ou /b/{slug}) : petit paquet, sans compte ni client Supabase ;
 *  - site QASH : tout le reste.
 * Chacune n'est téléchargée que si elle est utile (important sur 3G).
 */
const slug = getShopSlug();
const root = createRoot(document.getElementById('root')!);

if (slug !== null) {
  import('./shop/ShopApp').then(({ ShopApp }) => {
    root.render(
      <StrictMode>
        <ShopApp slug={slug} />
      </StrictMode>
    );
  });
} else {
  import('./App.tsx').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
}
