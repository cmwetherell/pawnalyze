// components/Navbar.js
import Link from 'next/link';
import Image from 'next/image';

import logo from '../public/img/pawnalyzeFull.png';

const links = [
    { href: 'https://blog.pawnalyze.com', text: 'Blog' },
    { href: '/simulations', text: 'Simulations' },
    { href: '/elocator', text: 'Elocator' },
    { href: '/about', text: 'About' }
  ];
  

const Navbar = () => {
    return (
    <header className="w-full border-b border-gold/20 sticky top-0 z-50 bg-ebony/95 backdrop-blur-md supports-[backdrop-filter]:bg-ebony/80 transition-elegant">
        <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link 
              href="/"
              className="group relative transition-elegant"
            >
              <div className="absolute inset-0 bg-gold/10 rounded-lg opacity-0 group-hover:opacity-100 transition-elegant blur-sm"></div>
              <Image 
                  src={logo}
                  alt="Pawnalyze Logo"
                  sizes="100vw"
                  className="relative z-10 transition-elegant group-hover:brightness-110"
                  style={{
                    maxHeight: '45px',
                    width: 'auto',
                    filter: 'brightness(1.1)',
                  }}
              />
            </Link>
          </div>
          <nav className="flex items-center space-x-1">
            {links.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.href}
                  className="relative px-4 py-2 text-ivory/80 hover:text-gold font-body text-sm tracking-wide transition-elegant group"
                >
                  <span className="relative z-10">{link.text}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-elegant group-hover:w-full"></span>
                </Link>
            ))}
          </nav>
        </div>
      </header>
    );
  };

export default Navbar;
