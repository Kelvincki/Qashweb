import { PageRoute } from '../types';

const REDIRECT_STORAGE_KEY = 'qash_redirect_after_login';
const LEGACY_STORAGE_KEY = 'redirect_after_login';

/**
 * Routes autorisées pour la redirection après connexion :
 * '/pricing' et '/dashboard' uniquement.
 */
export const ALLOWED_REDIRECT_ROUTES: PageRoute[] = ['/pricing', '/dashboard'];

/**
 * Valide qu'une route est bien dans la liste autorisée.
 * Retourne '/dashboard' par défaut si la route n'est pas autorisée.
 */
export function validateRedirectRoute(route: string | null | undefined): PageRoute {
  if (route && ALLOWED_REDIRECT_ROUTES.includes(route as PageRoute)) {
    return route as PageRoute;
  }
  return '/dashboard';
}

/**
 * Mémorise la destination souhaitée après connexion (par exemple '/pricing').
 * Valide que la route fait partie des destinations autorisées.
 */
export function rememberRedirect(route: PageRoute): void {
  if (typeof window === 'undefined') return;
  try {
    const validated = validateRedirectRoute(route);
    sessionStorage.setItem(REDIRECT_STORAGE_KEY, validated);
  } catch (e) {
    console.warn('Impossible de mémoriser la redirection dans sessionStorage:', e);
  }
}

// Cache pour rendre consumeRedirect idempotente pendant 5 secondes
// (évite qu'un second appel immédiat lors du login écrase '/pricing' par '/dashboard')
let lastConsumed: PageRoute | null = null;
let lastConsumedAt = 0;

/**
 * Récupère et consomme (supprime) la destination mémorisée.
 * Renvoie une route validée ('/pricing' ou '/dashboard').
 * Idempotente sur 5 secondes pour supporter les doubles appels (ex: effet + navigation).
 */
export function consumeRedirect(): PageRoute {
  const now = Date.now();
  if (lastConsumed && now - lastConsumedAt < 5000) {
    return lastConsumed;
  }

  if (typeof window === 'undefined') return '/dashboard';
  try {
    const stored = 
      sessionStorage.getItem(REDIRECT_STORAGE_KEY) || 
      sessionStorage.getItem(LEGACY_STORAGE_KEY);
    
    sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);

    const result = validateRedirectRoute(stored);
    lastConsumed = result;
    lastConsumedAt = now;
    return result;
  } catch (e) {
    console.warn('Erreur lors de la lecture de la redirection:', e);
    return '/dashboard';
  }
}
