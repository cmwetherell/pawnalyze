import Link from 'next/link';
import { FaXTwitter, FaGithub } from 'react-icons/fa6';

const footerLinks = [
  { href: '/simulations', text: 'Simulations' },
  { href: '/elocator', text: 'Elocator' },
  { href: '/about', text: 'About' },
  { href: 'https://blog.pawnalyze.com', text: 'Blog', external: true },
];

const socialLinks = [
  { 
    href: 'https://www.twitter.com/pawnalyze', 
    icon: FaXTwitter, 
    label: 'Twitter' 
  },
  { 
    href: 'https://www.github.com/cmwetherell/pawnalyze', 
    icon: FaGithub, 
    label: 'GitHub' 
  },
];

const Footer = () => {
  return (
    <footer className="relative border-t border-border-subtle bg-bg-secondary/50">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/50 to-transparent pointer-events-none" />
      
      <div className="relative section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h3 className="font-heading text-2xl text-text-primary">
                Pawnalyze
              </h3>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md mb-6">
              Advanced chess analytics powered by Monte Carlo simulations and 
              AI-driven complexity analysis. Discover insights that transform 
              your understanding of the game.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <Link 
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="
                      w-10 h-10
                      flex items-center justify-center
                      rounded-lg
                      bg-white/5
                      text-text-secondary
                      transition-all duration-300 ease-out-expo
                      hover:bg-accent/10 hover:text-accent hover:scale-110
                    "
                  >
                    <Icon size={18} />
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="
                      text-sm text-text-secondary
                      transition-colors duration-300
                      hover:text-accent
                    "
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="https://github.com/cmwetherell/elocator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-sm text-text-secondary
                    transition-colors duration-300
                    hover:text-accent
                  "
                >
                  Elocator GitHub
                </Link>
              </li>
              <li>
                <Link 
                  href="https://blog.pawnalyze.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-sm text-text-secondary
                    transition-colors duration-300
                    hover:text-accent
                  "
                >
                  Research Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="https://candidates.fide.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-sm text-text-secondary
                    transition-colors duration-300
                    hover:text-accent
                  "
                >
                  FIDE Candidates
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Pawnalyze. All rights reserved.
          </p>
          <p className="text-sm text-text-muted">
            Built with ♔ for the chess community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
