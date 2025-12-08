import Link from "next/link";
import ChessButton from "@/components/Button";
import WCCSims from "@/components/WCCSims";

// Feature card data
const features = [
  {
    title: "Tournament Simulations",
    description: "Monte Carlo simulations predict tournament outcomes with statistical precision.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 14l4-4 4 4 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    href: "/simulations",
  },
  {
    title: "Complexity Analysis",
    description: "AI-powered position complexity scores reveal what makes chess positions difficult.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    href: "/elocator",
  },
  {
    title: "Deep Insights",
    description: "Analysis featured in The New York Times, NPR, and leading chess publications.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    href: "/about",
  },
];

// Stats data
const stats = [
  { value: "10K+", label: "Simulations Run" },
  { value: "100K+", label: "Moves Analyzed" },
  { value: "50+", label: "Tournaments Covered" },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large Chess Knight Silhouette */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] opacity-[0.03]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-amber-400">
              <path d="M19 22H5v-2h14v2zM17.5 8c.5 0 1.5-.5 1.5-2 0-1.5-1-2-1.5-2-.5 0-1.5.5-1.5 2 0 1.5 1 2 1.5 2zM13 2c-.5 0-1.5.5-1.5 2.5 0 1 .5 1.5 1 2l-1 6.5c-2.5.5-4.5 3-4.5 5.5V20h10v-1.5c0-2.5-2-5-4.5-5.5l-1-6.5c.5-.5 1-1 1-2C12.5 2.5 11.5 2 11 2h2z" />
            </svg>
          </div>
          
          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl animate-float delay-300" />
        </div>

        <div className="section-container relative z-10 pt-24 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 mb-8 animate-fade-in-down">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-sm font-medium">World Championship Live</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6 opacity-0 animate-fade-in-up delay-100">
              <span className="text-ivory-100">Chess Analytics</span>
              <br />
              <span className="text-gradient">Reimagined</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-obsidian-300 max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up delay-200">
              Predict tournament outcomes, analyze position complexity, and discover insights 
              that transform how you understand the game.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up delay-300">
              <ChessButton
                text="Explore Simulations"
                link="/simulations"
                variant="primary"
                size="lg"
              />
              <ChessButton
                text="Try Elocator"
                link="/elocator"
                variant="secondary"
                size="lg"
              />
            </div>

            {/* Stats Row */}
            <div className="mt-16 pt-16 border-t border-white/[0.06] opacity-0 animate-fade-in-up delay-500">
              <div className="grid grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-display text-3xl sm:text-4xl font-bold text-amber-400 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-obsidian-400 text-sm uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in delay-700">
          <span className="text-obsidian-500 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-obsidian-500 to-transparent" />
        </div>
      </section>

      {/* World Championship Section */}
      <section className="py-24 relative">
        <div className="section-container">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-4">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Live Event</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ivory-100 mb-4">
              World Championship Simulations
            </h2>
            <p className="text-obsidian-400 max-w-2xl mx-auto">
              Real-time probability updates for the FIDE World Chess Championship. 
              Watch as predictions evolve with each game.
            </p>
          </div>

          {/* Chart Container */}
          <div className="glass-card p-6 md:p-8">
            <WCCSims justGraph={true} />
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <ChessButton
              text="Interactive Simulations"
              link="/simulations/fide-world-championship-singapore-2024"
              variant="secondary"
              size="md"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="section-container relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="accent-line mx-auto mb-6" />
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ivory-100 mb-4">
              Powerful Analytics
            </h2>
            <p className="text-obsidian-400 max-w-2xl mx-auto">
              From Monte Carlo simulations to neural network-powered complexity analysis, 
              discover tools that provide unique insights into chess.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group glass-card p-8 relative overflow-hidden"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-ivory-100 mb-3 group-hover:text-amber-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-obsidian-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow */}
                <div className="mt-6 flex items-center gap-2 text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                  <span>Explore</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950 via-obsidian-900/50 to-obsidian-950" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-400/5 rounded-full blur-3xl" />
        </div>

        <div className="section-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ivory-100 mb-6">
              Ready to explore the depths of <span className="text-gradient">chess analytics</span>?
            </h2>
            <p className="text-obsidian-300 text-lg mb-10 max-w-xl mx-auto">
              Try our position complexity calculator and discover what makes chess positions 
              truly challenging for grandmasters.
            </p>
            <ChessButton
              text="Launch Elocator"
              link="/elocator"
              variant="primary"
              size="lg"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
