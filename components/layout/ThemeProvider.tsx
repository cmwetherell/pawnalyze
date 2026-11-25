'use client';

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from 'react';

import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

/* The class on <html> is the single source of truth: the script in app/layout.tsx sets it before first paint. */
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const onStorage = (e: StorageEvent) => {
    if (e.key === 'theme') apply(e.newValue === 'light' ? 'light' : 'dark');
  };
  window.addEventListener('storage', onStorage);
  return () => {
    mo.disconnect();
    window.removeEventListener('storage', onStorage);
  };
}
const read = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
const readServer = (): Theme => 'dark';
function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, read, readServer);
  const toggleTheme = useCallback(() => {
    const next: Theme = read() === 'dark' ? 'light' : 'dark';
    apply(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage blocked: the choice lasts for this page.
    }
  }, []);
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

/** Shows the icon of the theme you would switch to. CSS picks it, so it is right before hydration. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <IconButton
      className={className}
      label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      icon={<><Icon name="sun" className="hidden dark:block" /><Icon name="moon" className="dark:hidden" /></>}
    />
  );
}
