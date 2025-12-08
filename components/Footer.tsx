import Link from "next/link";
import { FaXTwitter, FaGithub } from "react-icons/fa6";

const socialLinks = [
  { href: "https://www.twitter.com/pawnalyze", icon: FaXTwitter, label: "Twitter" },
  { href: "https://www.github.com/cmwetherell/pawnalyze", icon: FaGithub, label: "GitHub" },
];

const footerLinks = [
  { label: "Simulations", href: "/simulations" },
  { label: "Elocator", href: "/elocator" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "https://blog.pawnalyze.com" },
];

const Footer = () => {
  return (
    <footer className="relative mt-16 border-t border-white/10 bg-[rgba(5,6,10,0.8)]">
      <div className="container flex flex-col gap-10 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl text-sand">Pawnalyze</p>
          <p className="text-sm text-sand-muted">Chess analytics built like a signal lab.</p>
        </div>

        <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-sand-muted">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-amber">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          {socialLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-sand transition hover:border-amber/60 hover:text-amber"
            >
              <Icon size="1.2em" />
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 bg-black/40 py-4 text-center text-xs text-sand-muted">
        &copy; {new Date().getFullYear()} Pawnalyze. Crafted in Seattle.
      </div>
    </footer>
  );
};

export default Footer;
