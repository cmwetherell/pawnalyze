import Link from "next/link";
import Image from "next/image";
import logo from "../public/img/pawnalyzeFull.png";

const links = [
  { href: "/simulations", text: "Simulations" },
  { href: "/elocator", text: "Elocator" },
  { href: "/about", text: "About" },
  { href: "https://blog.pawnalyze.com", text: "Field Notes" },
];

const signalChips = [
  { label: "Live Signals", value: "10,240+" },
  { label: "Datasets", value: "38" },
  { label: "Pulse Update", value: "Realtime" },
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[rgba(5,6,10,0.85)] backdrop-blur-2xl shadow-subtle">
      <div className="container flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-amber/30 bg-gradient-to-br from-amber/20 to-transparent shadow-glow">
              <Image
                src={logo}
                alt="Pawnalyze logo"
                className="h-8 w-auto object-contain grayscale contrast-200"
                priority
                width={48}
                height={48}
              />
            </div>
            <div className="leading-tight">
              <p className="font-display text-xs uppercase tracking-[0.6em] text-sand-muted">
                Pawnalyze
              </p>
              <p className="font-display text-2xl text-sand">Chess Signal Lab</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm uppercase tracking-[0.25em] text-sand-muted md:flex">
            {links.map((link) => (
              <Link
                key={link.text}
                href={link.href}
                className="group relative pb-1 transition-all duration-300 hover:text-sand"
              >
                {link.text}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-amber to-transparent transition-transform duration-300 group-hover:scale-x-100"></span>
              </Link>
            ))}
          </nav>

          <Link
            href="/simulations"
            className="group relative inline-flex items-center gap-2 rounded-full border border-amber/30 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sand transition hover:border-amber/60 hover:text-amber"
          >
            Launch Console
            <span className="inline-block transition duration-300 group-hover:translate-x-1">
              {'->'}
            </span>
          </Link>
        </div>

        <div className="hidden grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs uppercase tracking-[0.3em] text-sand-muted md:grid">
          {signalChips.map((chip) => (
            <div key={chip.label} className="flex items-center justify-between">
              <span className="text-[0.65rem] text-sand-muted">{chip.label}</span>
              <span className="font-display text-sand">{chip.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ticker-track border-t border-white/10 bg-black/40 text-[0.65rem] text-sand-muted">
        <div className="ticker-loop">
          <span>Signal 64 • Chess Forecast Network • Human Complexity Index</span>
          <span>Live Feeds {'->'} Candidates • Olympiad • WCC • Elocator</span>
          <span>Model Build 05 · Hyperspeed Monte Carlo • Pawnalyze Studios</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
