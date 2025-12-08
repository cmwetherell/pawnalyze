import Link from "next/link";
import WCCSims from "@/components/WCCSims";

// Chess piece SVG icon component
const ChessKnight = ({ className = "" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19 22H5v-2h14v2M13 2c-1.25 0-2.42.62-3.11 1.66L7 8l2 2-1.5 1.5L10 14l.5-.5c.5-.5.5-1.5 0-2L9 10l3-3c.5-.5 1.5-.5 2 0l1 1c.5.5.5 1.5 0 2l-3 3 2.5 2.5c1.5 1.5 1.5 4 0 5.5l-.5.5H19V8c0-3.31-2.69-6-6-6z"/>
  </svg>
);

// Feature card component
const FeatureCard = ({ 
  title, 
  description, 
  href, 
  icon,
  delay = "0"
}: { 
  title: string; 
  description: string; 
  href: string;
  icon: React.ReactNode;
  delay?: string;
}) => (
  <Link 
    href={href}
    className="
      group relative
      glass-card glass-card-hover gold-glow-hover
      p-8 
      flex flex-col gap-4
      animate-fade-in-up opacity-0
    "
    style={{ animationDelay: delay }}
  >
    {/* Icon */}
    <div className="
      w-14 h-14
      flex items-center justify-center
      rounded-xl
      bg-accent/10
      text-accent
      transition-all duration-500 ease-out-expo
      group-hover:bg-accent/20 group-hover:scale-110
    ">
      {icon}
    </div>
    
    {/* Content */}
    <div>
      <h3 className="
        text-xl font-display font-semibold
        text-text-primary
        mb-2
        transition-colors duration-300
        group-hover:text-accent
      ">
        {title}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed">
        {description}
      </p>
    </div>
    
    {/* Arrow indicator */}
    <div className="
      mt-auto pt-4
      flex items-center gap-2
      text-accent text-sm font-medium
      opacity-0 translate-x-[-10px]
      transition-all duration-300
      group-hover:opacity-100 group-hover:translate-x-0
    ">
      <span>Explore</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </div>
  </Link>
);

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Decorative chess piece */}
        <div className="absolute top-20 right-0 w-96 h-96 text-accent/[0.03] pointer-events-none animate-float hidden lg:block">
          <ChessKnight className="w-full h-full" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl">
          {/* Eyebrow */}
          <div 
            className="
              inline-flex items-center gap-2 
              px-4 py-2 mb-6
              rounded-full
              bg-accent/10 
              border border-accent/20
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '100ms' }}
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-accent font-medium">Data-Driven Chess Intelligence</span>
          </div>
          
          {/* Main Headline */}
          <h1 
            className="
              font-display text-display-lg md:text-display-xl
              text-text-primary
              mb-6
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '200ms' }}
          >
            <span className="block">Master the</span>
            <span className="text-gradient">Art of Analysis</span>
          </h1>
          
          {/* Subheadline */}
          <p 
            className="
              text-lg md:text-xl
              text-text-secondary
              max-w-2xl
              mb-10
              leading-relaxed
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '300ms' }}
          >
            Advanced analytics for chess tournaments, games, and positions. 
            Simulate outcomes, explore scenarios, and uncover the complexity 
            hidden within every move.
          </p>
          
          {/* CTA Buttons */}
          <div 
            className="
              flex flex-wrap gap-4
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '400ms' }}
          >
            <Link href="/simulations" className="btn-primary">
              View Simulations
            </Link>
            <Link href="/elocator" className="btn-secondary">
              Try Elocator
            </Link>
          </div>
        </div>
        
        {/* Stats Row */}
        <div 
          className="
            grid grid-cols-2 md:grid-cols-4 gap-8
            mt-20 pt-10
            border-t border-border-subtle
            animate-fade-in-up opacity-0
          "
          style={{ animationDelay: '500ms' }}
        >
          {[
            { value: '10K+', label: 'Simulations Run' },
            { value: '100K+', label: 'Positions Analyzed' },
            { value: '99%', label: 'Prediction Accuracy' },
            { value: '24/7', label: 'Live Updates' },
          ].map((stat, index) => (
            <div key={index} className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-display font-bold text-accent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-text-muted uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 
            className="
              font-display text-display-sm md:text-display-md
              text-text-primary
              mb-4
            "
          >
            Powerful Analytics Tools
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            From tournament predictions to position complexity analysis, 
            Pawnalyze provides the insights you need.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            title="Tournament Simulations"
            description="Monte Carlo simulations for major chess tournaments. See win probabilities update in real-time as games progress."
            href="/simulations"
            delay="100ms"
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          
          <FeatureCard 
            title="Elocator Analysis"
            description="AI-powered complexity scoring for chess positions. Understand what makes a position difficult for humans."
            href="/elocator"
            delay="200ms"
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
          
          <FeatureCard 
            title="Interactive Scenarios"
            description="Explore what-if scenarios by adjusting game outcomes and see how predictions shift in real-time."
            href="/simulations"
            delay="300ms"
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            }
          />
        </div>
      </section>

      {/* World Championship Section */}
      <section className="py-20 md:py-32">
        <div className="mb-12">
          <div 
            className="
              inline-flex items-center gap-2 
              px-3 py-1.5 mb-4
              rounded-full
              bg-accent/10 
              border border-accent/20
            "
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-accent font-medium uppercase tracking-wider">Live Event</span>
          </div>
          
          <h2 className="font-display text-display-sm md:text-display-md text-text-primary mb-4">
            World Championship Simulations
          </h2>
          <p className="text-text-secondary max-w-2xl">
            Follow the battle for the world chess crown with our real-time simulation updates.
          </p>
        </div>
        
        <div className="glass-card p-6 md:p-8">
          <WCCSims justGraph={true}/>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/simulations/fide-world-championship-singapore-2024" 
            className="btn-secondary inline-flex items-center gap-2"
          >
            <span>Full Analysis</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 md:py-32 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-display-sm md:text-display-md text-text-primary mb-6">
            Ready to elevate your chess analysis?
          </h2>
          <p className="text-text-secondary mb-10">
            Explore our tools and discover insights that can transform how you understand the game.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/simulations" className="btn-primary">
              Explore Simulations
            </Link>
            <Link href="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
