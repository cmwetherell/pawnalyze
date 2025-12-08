import Link from "next/link";
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import { FiArrowUpRight } from "react-icons/fi";

const footerLinks = [
  { label: "Simulations", href: "/simulations" },
  { label: "Elocator", href: "/elocator" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "https://blog.pawnalyze.com" },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[rgba(3,4,10,0.92)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="tag-pill">Pawnalyze</p>
          <h3 className="font-display text-2xl uppercase tracking-[0.35em] text-paper">Chess intel lab</h3>
          <p className="text-sm text-slate">
            Data-native coverage of world chess. Live probability engines, scenario sculpting, and human-readable
            complexity.
          </p>
          <div className="flex gap-4 pt-2 text-slate">
            <a href="https://www.twitter.com/pawnalyze" aria-label="Pawnalyze on X" className="transition hover:text-mint" target="_blank" rel="noreferrer">
              <FaXTwitter size="1.25em" />
            </a>
            <a href="https://www.github.com/cmwetherell/pawnalyze" aria-label="Pawnalyze on GitHub" className="transition hover:text-mint" target="_blank" rel="noreferrer">
              <FaGithub size="1.25em" />
            </a>
          </div>
        </div>

        <div className="grid flex-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate">Navigate</p>
            <div className="mt-3 space-y-2">
              {footerLinks.map((link) =>
                link.href.startsWith("http") ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 text-sm text-paper transition hover:text-mint"
                  >
                    <span>{link.label}</span>
                    <FiArrowUpRight className="text-xs opacity-0 transition group-hover:opacity-100" />
                  </a>
                ) : (
                  <Link key={link.label} href={link.href} className="group flex items-center gap-2 text-sm text-paper transition hover:text-mint">
                    <span>{link.label}</span>
                  </Link>
                )
              )}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate">Telemetry</p>
            <div className="mt-3 space-y-3 text-sm text-slate">
              <p>
                <span className="text-paper">62k+</span> simulations per nightly run
              </p>
              <p>
                <span className="text-paper">90th</span> percentile coverage latency
              </p>
              <p>© {new Date().getFullYear()} Pawnalyze</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
