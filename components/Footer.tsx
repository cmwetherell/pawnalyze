import Link from 'next/link';
import { FaXTwitter, FaGithub } from 'react-icons/fa6';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: '/simulations', label: 'Simulations' },
      { href: '/elocator', label: 'Elocator' },
      { href: 'https://blog.pawnalyze.com', label: 'Blog', external: true },
    ],
    resources: [
      { href: '/about', label: 'About' },
      { href: 'https://github.com/cmwetherell/pawnalyze', label: 'GitHub', external: true },
    ],
  };

  return (
    <footer className="relative mt-auto">
      {/* Top Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              {/* Chess Knight Icon */}
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg opacity-20 group-hover:opacity-30 transition-opacity" />
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="w-5 h-5 text-amber-400"
                >
                  <path 
                    d="M19 22H5v-2h14v2zM17.5 8c.5 0 1.5-.5 1.5-2 0-1.5-1-2-1.5-2-.5 0-1.5.5-1.5 2 0 1.5 1 2 1.5 2zM13 2c-.5 0-1.5.5-1.5 2.5 0 1 .5 1.5 1 2l-1 6.5c-2.5.5-4.5 3-4.5 5.5V20h10v-1.5c0-2.5-2-5-4.5-5.5l-1-6.5c.5-.5 1-1 1-2C12.5 2.5 11.5 2 11 2h2z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                <span className="text-ivory-100">Pawn</span>
                <span className="text-amber-400">alyze</span>
              </span>
            </Link>
            
            <p className="text-obsidian-400 text-sm leading-relaxed max-w-sm">
              Advanced chess analytics powered by Monte Carlo simulations and neural networks. 
              Discover insights, predict outcomes, and analyze complexity.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <Link
                href="https://www.twitter.com/pawnalyze"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-amber-400/30 hover:bg-amber-400/5 transition-all duration-300"
                aria-label="Follow on X/Twitter"
              >
                <FaXTwitter className="w-4 h-4 text-obsidian-400 group-hover:text-amber-400 transition-colors" />
              </Link>
              <Link
                href="https://www.github.com/cmwetherell/pawnalyze"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-amber-400/30 hover:bg-amber-400/5 transition-all duration-300"
                aria-label="View on GitHub"
              >
                <FaGithub className="w-4 h-4 text-obsidian-400 group-hover:text-amber-400 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Product Links */}
            <div>
              <h4 className="text-ivory-100 font-semibold text-sm uppercase tracking-wider mb-4">
                Product
              </h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-obsidian-400 text-sm hover:text-amber-400 transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-ivory-100 font-semibold text-sm uppercase tracking-wider mb-4">
                Resources
              </h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-obsidian-400 text-sm hover:text-amber-400 transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter / Contact */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-ivory-100 font-semibold text-sm uppercase tracking-wider mb-4">
                Stay Updated
              </h4>
              <p className="text-obsidian-400 text-sm mb-4">
                Follow us on X for the latest chess analytics insights.
              </p>
              <Link
                href="https://twitter.com/pawnalyze"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-2 px-4 inline-flex"
              >
                Follow @pawnalyze
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-obsidian-500 text-sm">
              © {currentYear} Pawnalyze. Built with passion for chess.
            </p>
            <div className="flex items-center gap-1 text-obsidian-500 text-sm">
              <span>Made by</span>
              <Link 
                href="https://twitter.com/pawnalyze" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                Caleb Wetherell
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
