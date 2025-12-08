'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import logo from '../public/img/pawnalyzeFull.png';

const links = [
  { href: 'https://blog.pawnalyze.com', text: 'Blog', external: true },
  { href: '/simulations', text: 'Simulations', external: false },
  { href: '/elocator', text: 'Elocator', external: false },
  { href: '/about', text: 'About', external: false }
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 
        transition-all duration-500 ease-out-expo
        ${scrolled 
          ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle shadow-lg' 
          : 'bg-transparent'
        }
      `}
    >
      <nav className="section-container">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="relative group flex items-center gap-3"
          >
            <div className="relative overflow-hidden rounded-lg">
              <Image 
                src={logo}
                alt="Pawnalyze Logo"
                width={160}
                height={40}
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                style={{ filter: 'brightness(1.1)' }}
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link, index) => (
              <Link 
                key={index} 
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="
                  relative px-5 py-2.5 
                  text-sm font-medium tracking-wide
                  text-text-secondary
                  transition-all duration-300 ease-out-expo
                  hover:text-text-primary
                  group
                "
              >
                <span className="relative z-10">{link.text}</span>
                
                {/* Hover Background */}
                <span className="
                  absolute inset-0 rounded-lg
                  bg-white/0 
                  transition-all duration-300 ease-out-expo
                  group-hover:bg-white/5
                " />
                
                {/* Gold Underline */}
                <span className="
                  absolute bottom-1.5 left-5 right-5 h-px
                  bg-gradient-to-r from-accent/0 via-accent to-accent/0
                  scale-x-0 origin-center
                  transition-transform duration-300 ease-out-expo
                  group-hover:scale-x-100
                " />
              </Link>
            ))}
            
            {/* CTA Button */}
            <Link 
              href="/elocator"
              className="
                ml-4 px-5 py-2.5
                text-sm font-semibold tracking-wide uppercase
                text-bg-primary
                bg-gradient-gold
                rounded-lg
                shadow-glow-sm
                transition-all duration-300 ease-out-expo
                hover:shadow-glow-md hover:scale-[1.02]
                active:scale-[0.98]
              "
            >
              Try Elocator
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="
              md:hidden relative w-10 h-10
              flex items-center justify-center
              text-text-primary
              transition-colors duration-300
              hover:text-accent
            "
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-5 flex flex-col justify-between">
              <span 
                className={`
                  block h-0.5 bg-current rounded-full
                  transition-all duration-300 ease-out-expo origin-center
                  ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}
                `}
              />
              <span 
                className={`
                  block h-0.5 bg-current rounded-full
                  transition-all duration-300 ease-out-expo
                  ${mobileMenuOpen ? 'opacity-0 scale-0' : ''}
                `}
              />
              <span 
                className={`
                  block h-0.5 bg-current rounded-full
                  transition-all duration-300 ease-out-expo origin-center
                  ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}
                `}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`
            md:hidden overflow-hidden
            transition-all duration-500 ease-out-expo
            ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="py-4 space-y-1 border-t border-border-subtle">
            {links.map((link, index) => (
              <Link 
                key={index} 
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="
                  block px-4 py-3
                  text-base font-medium
                  text-text-secondary
                  rounded-lg
                  transition-all duration-300
                  hover:text-text-primary hover:bg-white/5 hover:pl-6
                "
              >
                {link.text}
              </Link>
            ))}
            
            <Link 
              href="/elocator"
              onClick={() => setMobileMenuOpen(false)}
              className="
                block mx-4 mt-4 px-5 py-3
                text-center text-sm font-semibold tracking-wide uppercase
                text-bg-primary
                bg-gradient-gold
                rounded-lg
                transition-all duration-300
                hover:shadow-glow-md
              "
            >
              Try Elocator
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
