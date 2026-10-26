import React, { createContext, useContext } from 'react';
import { PageRoute } from '../types';

export type CurrentRoute = PageRoute | 'not-found';

interface NavigationContextValue {
  currentRoute: CurrentRoute;
  navigate: (route: PageRoute, hash?: string) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export const NavigationProvider = NavigationContext.Provider;

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation doit être utilisé dans NavigationProvider');
  return ctx;
}

interface AppLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: PageRoute;
  hash?: string;
}

/**
 * Vrai lien <a href> (clic molette, nouvel onglet, robots) qui navigue
 * sans recharger la page pour un clic simple.
 */
export const AppLink = React.forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink(
  { to, hash, onClick, children, ...rest },
  ref
) {
  const { navigate } = useNavigation();
  return (
    <a
      ref={ref}
      href={hash ? `${to}${hash}` : to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to, hash);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});
