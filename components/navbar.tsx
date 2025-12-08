'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import logo from '../public/img/pawnalyzeFull.png';

const links = [
  { href: 'https://blog.pawnalyze.com', text: 'Blog' },
  { href: '/simulations', text: 'Simulations' },
  { href: '/elocator', text: 'Elocator' },
  { href: '/about', text: 'About' }
];

const Navbar = () => {
  const pathname = usePathname();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-luxury-amber/20 bg-luxury-navy/95 backdrop-blur-md supports-[backdrop-filter]:bg-luxury-navy/80">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <Link 
            href="/" 
            className="flex items-center group transition-all duration-300 hover:opacity-80"
          >
            <div className="relative">
              <Image 
                src={logo}
                alt="Pawnalyze Logo"
                width={180}
                height={50}
                className="h-12 w-auto object-contain brightness-110 contrast-110"
                priority
              />
              <div className="absolute inset-0 bg-luxury-gold/0 group-hover:bg-luxury-gold/10 transition-all duration-300 rounded-sm" />
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            {links.map((link, index) => {
              const isExternal = link.href.startsWith('http');
              const isActive = !isExternal && pathname === link.href;
              
              return (
                <Link
                  key={index}
                  href={link.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className={`
                    relative px-6 py-2 text-sm font-medium tracking-wide
                    transition-all duration-300
                    ${isActive 
                      ? 'text-luxury-gold' 
                      : 'text-luxury-cream/80 hover:text-luxury-gold'
                    }
                    group
                  `}
                >
                  <span className="relative z-10">{link.text}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-amber transform transition-all duration-300" />
                  )}
                  <span className="absolute inset-0 bg-luxury-amber/0 group-hover:bg-luxury-amber/5 transition-all duration-300" />
                </Link>
              );
            })}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-luxury-cream/80 hover:text-luxury-gold transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
