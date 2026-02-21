import Link from 'next/link';
import React from 'react';
import { FaXTwitter, FaGithub } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-surface-1)]">
      {/* Gold accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-chess-gold/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <p className="font-heading text-lg text-[var(--text-primary)]">Pawnalyze</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Data-driven chess analytics powered by Monte Carlo simulations.
            </p>
          </div>

          {/* Tools */}
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Tools</p>
            <div className="space-y-2">
              <Link href="/simulations" className="block text-sm text-[var(--text-muted)] hover:text-chess-gold transition-colors">
                Simulations
              </Link>
              <Link href="/elocator" className="block text-sm text-[var(--text-muted)] hover:text-chess-gold transition-colors">
                Elocator
              </Link>
              <Link href="https://blog.pawnalyze.com" className="block text-sm text-[var(--text-muted)] hover:text-chess-gold transition-colors">
                Blog
              </Link>
            </div>
          </div>

          {/* Active Tournaments */}
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Active Tournaments</p>
            <div className="space-y-2">
              <Link href="/simulations/candidates-2026" className="block text-sm text-[var(--text-muted)] hover:text-chess-gold transition-colors">
                2026 Candidates
              </Link>
              <Link href="/simulations/womens-candidates-2026" className="block text-sm text-[var(--text-muted)] hover:text-chess-gold transition-colors">
                2026 Women&apos;s Candidates
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Social</p>
            <div className="flex items-center gap-3">
              <Link href="https://www.twitter.com/pawnalyze" className="text-[var(--text-muted)] hover:text-chess-gold transition-colors">
                <FaXTwitter size="1.25em" />
              </Link>
              <Link href="https://www.github.com/cmwetherell/pawnalyze" className="text-[var(--text-muted)] hover:text-chess-gold transition-colors">
                <FaGithub size="1.25em" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; 2025 Pawnalyze. Built by Caleb Wetherell.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
