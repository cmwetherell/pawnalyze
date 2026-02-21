'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from './ThemeProvider';

import logo from '../public/img/pawnalyzeFull.png';

const links = [
  { href: '/simulations', text: 'Simulations' },
  { href: '/elocator', text: 'Elocator' },
  { href: '/about', text: 'About' },
  { href: 'https://blog.pawnalyze.com', text: 'Blog', external: true },
];

const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-base)]/95 backdrop-blur-md border-b border-[var(--border)]" style={{ height: '64px' }}>
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center h-full">
          <Link href="/">
            <Image
              src={logo}
              alt="Pawnalyze Logo"
              sizes="100vw"
              className="dark:brightness-0 dark:invert"
              style={{
                maxHeight: '40px',
                width: 'auto',
              }}
            />
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 h-full">
          {links.map((link) => {
            const isActive = !link.external && pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-chess-gold bg-chess-gold/10'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-1)]'
                }`}
              >
                {link.text}
                {link.external && (
                  <svg className="inline-block w-3 h-3 ml-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </Link>
            );
          })}
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-1)] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--bg-base)] border-b border-[var(--border)] px-4 pb-4">
          {links.map((link) => {
            const isActive = !link.external && pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-chess-gold bg-chess-gold/10'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-1)]'
                }`}
              >
                {link.text}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
