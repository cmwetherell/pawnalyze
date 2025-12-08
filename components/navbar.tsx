'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const links = [
  { href: 'https://blog.pawnalyze.com', text: 'Blog', external: true },
  { href: '/simulations', text: 'Simulations', external: false },
  { href: '/elocator', text: 'Elocator', external: false },
  { href: '/about', text: 'About', external: false }
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500 ease-out-expo
        ${isScrolled 
          ? 'bg-obsidian-950/80 backdrop-blur-xl border-b border-white/[0.06]' 
          : 'bg-transparent'
        }
      `}
    >
      <nav className="section-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
          >
            {/* Chess Knight Icon */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg opacity-20 group-hover:opacity-30 transition-opacity" />
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-6 h-6 text-amber-400"
              >
                <path 
                  d="M19 22H5v-2h14v2zM17.5 8c.5 0 1.5-.5 1.5-2 0-1.5-1-2-1.5-2-.5 0-1.5.5-1.5 2 0 1.5 1 2 1.5 2zM13 2c-.5 0-1.5.5-1.5 2.5 0 1 .5 1.5 1 2l-1 6.5c-2.5.5-4.5 3-4.5 5.5V20h10v-1.5c0-2.5-2-5-4.5-5.5l-1-6.5c.5-.5 1-1 1-2C12.5 2.5 11.5 2 11 2h2z" 
                  fill="currentColor"
                />
              </svg>
            </div>
            
            {/* Brand Name */}
            <span className="font-display text-2xl font-semibold tracking-tight">
              <span className="text-ivory-100">Pawn</span>
              <span className="text-amber-400">alyze</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={index}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className={`
                    relative px-4 py-2 text-sm font-medium tracking-wide
                    transition-colors duration-300
                    ${isActive 
                      ? 'text-amber-400' 
                      : 'text-obsidian-300 hover:text-ivory-100'
                    }
                  `}
                >
                  {link.text}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                  )}
                </Link>
              );
            })}
            
            {/* CTA Button */}
            <Link
              href="/elocator"
              className="ml-4 btn-primary text-xs py-2.5 px-5"
            >
              Try Elocator
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-4 flex flex-col justify-between">
              <span 
                className={`
                  block h-0.5 w-full bg-ivory-100 rounded-full
                  transition-all duration-300 origin-center
                  ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}
                `} 
              />
              <span 
                className={`
                  block h-0.5 w-full bg-ivory-100 rounded-full
                  transition-all duration-300
                  ${isMobileMenuOpen ? 'opacity-0 scale-0' : ''}
                `} 
              />
              <span 
                className={`
                  block h-0.5 w-full bg-ivory-100 rounded-full
                  transition-all duration-300 origin-center
                  ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}
                `} 
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`
          md:hidden fixed inset-x-0 top-20 
          bg-obsidian-950/95 backdrop-blur-xl 
          border-b border-white/[0.06]
          transition-all duration-500 ease-out-expo
          ${isMobileMenuOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
          }
        `}
      >
        <div className="section-container py-6 space-y-1">
          {links.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={index}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-lg text-base font-medium
                  transition-all duration-300
                  ${isActive 
                    ? 'text-amber-400 bg-amber-400/10' 
                    : 'text-obsidian-300 hover:text-ivory-100 hover:bg-white/[0.03]'
                  }
                `}
              >
                {link.text}
              </Link>
            );
          })}
          
          <div className="pt-4">
            <Link
              href="/elocator"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-primary w-full text-center"
            >
              Try Elocator
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
