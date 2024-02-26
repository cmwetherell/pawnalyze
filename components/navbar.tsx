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
    <header className="text-black p-2 w-full border-b border-white-100 sticky top-0 z-50 bg-white" style={{ height: '70px' }}>
        {/* sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 */}
        <div className="container mx-auto flex justify-between items-center h-full">
          <div className="text-lg font-bold flex items-center pr-2" style={{ height: '100%' }}>
            <Link href="/">
              <Image 
                  src={logo}
                  alt="Pawnalyze Logo"
                  sizes="100vw"
                  // Adjust the image to fit within the navbar height while maintaining aspect ratio
                  style={{
                    maxHeight: '50px', // Adjust the height to be within the navbar's height
                    width: 'auto', // Adjust width to be auto to maintain the aspect ratio
                  }}
              />
            </Link>
          </div>
          <div className="text-lg space-x-4 flex items-center" style={{ height: '100%' }}>
            {links.map((link, index) => (
                <Link key={index} href={link.href}>
                {link.text}
                </Link>
            ))}
            </div>
        </div>
      </header>
    );
  };

export default Navbar;
