import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

const navLinks = [
  { href: "/simulations", text: "Simulations" },
  { href: "/elocator", text: "Elocator" },
  { href: "/about", text: "About" },
  { href: "https://blog.pawnalyze.com", text: "Journal", external: true },
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[rgba(5,6,10,0.7)] backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5">
        <Link href="/" className="group flex items-center gap-4 text-paper">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-ink-soft via-[#131528] to-[#090b16]">
            <span className="absolute inset-1 rounded-full border border-mint/40" />
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(114,245,199,0.7),transparent_55%)] opacity-70 transition duration-500 group-hover:scale-110" />
            <span className="absolute inset-0 bg-[conic-gradient(from_90deg,transparent,rgba(246,193,119,0.4),transparent_70%)] blur-lg opacity-70" />
          </div>
          <div>
            <p className="font-display text-sm uppercase tracking-[0.6em] text-paper">Pawnalyze</p>
            <p className="text-xs text-slate/80">Chess intelligence lab</p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 text-sm text-slate md:flex">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.text}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="relative rounded-full px-3 py-2 font-medium text-slate transition hover:text-paper"
              >
                <span className="absolute inset-0 rounded-full border border-transparent bg-white/0 transition-all duration-300 hover:border-mint/40 hover:bg-white/5" />
                <span className="relative z-10">{link.text}</span>
              </a>
            ) : (
              <Link
                key={link.text}
                href={link.href}
                className="relative rounded-full px-3 py-2 font-medium text-slate transition hover:text-paper"
              >
                <span className="absolute inset-0 rounded-full border border-transparent bg-white/0 transition-all duration-300 hover:border-mint/40 hover:bg-white/5" />
                <span className="relative z-10">{link.text}</span>
              </Link>
            )
          )}
        </nav>

        <Link
          href="/simulations"
          className="accent-border group hidden items-center gap-3 rounded-full bg-gradient-to-r from-[#101225] to-[#15172c] px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-paper shadow-glow md:inline-flex"
        >
          <span>Launch sims</span>
          <FiArrowUpRight className="transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.text}
              href={link.href}
              className="rounded-full border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate"
            >
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
